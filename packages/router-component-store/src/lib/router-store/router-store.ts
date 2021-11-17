import {
  ErrorHandler,
  EventEmitter,
  Inject,
  Injectable,
  Type,
} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Data,
  Event as AngularRouterEvent,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Params,
  Router,
  RouterEvent,
  RoutesRecognized,
} from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import {
  BaseRouterStoreState,
  NavigationActionTiming,
  RouterState,
  RouterStateSerializer,
  SerializedRouterStateSnapshot,
} from '@ngrx/router-store';
import { filter, map, Observable, skipWhile, tap, withLatestFrom } from 'rxjs';

import {
  isSameUrl,
  RouterTrigger,
} from './@ngrx/router-store/router_store_module';
import {
  RouterStoreConfig,
  routerStoreConfigToken,
} from './router-store-config';
import { routerStoreCancelType } from './router-store-events/router-store-cancel-event';
import { routerStoreErrorType } from './router-store-events/router-store-error-event';
import { RouterStoreEvent } from './router-store-events/router-store-event';
import { routerStoreNavigatedType } from './router-store-events/router-store-navigated-event';
import { routerStoreNavigationType } from './router-store-events/router-store-navigation-event';
import { routerStoreRequestType } from './router-store-events/router-store-request-event';
import { Optional } from './util-types/optional';

import type { PickTypes } from './util-types/pick-types';

interface RouterStoreEventPayload {
  readonly event: RouterEvent;
  readonly routerState?: SerializedRouterStateSnapshot;
}

type RouterStoreState<
  TRouterState extends BaseRouterStoreState = SerializedRouterStateSnapshot
> = {
  readonly navigationId: number | null;
  readonly routerState: TRouterState | null;
  readonly routesRecognized: RoutesRecognized | null;
  readonly trigger: RouterTrigger;
};

@Injectable({
  providedIn: 'root',
})
export class RouterStore extends ComponentStore<RouterStoreState> {
  #dispatchNavLate: boolean =
    this.config.navigationActionTiming ===
    NavigationActionTiming.PostActivation;
  #routerState$: Observable<SerializedRouterStateSnapshot | null> = this.select(
    (state) => state.routerState
    // TODO(@LayZeeDK): determine whether debounceAsync is necessary/works
    // { debounce: true }
  );
  #rootRoute$: Observable<ActivatedRouteSnapshot | null> = this.select(
    this.#routerState$,
    (routerState) => routerState?.root ?? null
  );
  #routerStoreEvent = new EventEmitter<RouterStoreEvent>();
  #routesRecognized$: Observable<RoutesRecognized> = this.select(
    (state) => state.routesRecognized as RoutesRecognized
  ).pipe(skipWhile((routesRecognized) => routesRecognized === null));
  #trigger$: Observable<RouterTrigger> = this.select(
    (state) => state.trigger as RouterTrigger
  );

  currentRoute$: Observable<ActivatedRouteSnapshot | undefined> = this.select(
    this.#rootRoute$,
    (rootRoute) => {
      if (!rootRoute) {
        return undefined;
      }

      let route = rootRoute;

      while (route.firstChild) {
        route = route.firstChild;
      }

      return route;
    }
  );
  fragment$: Observable<string | null> = this.select(
    this.#rootRoute$,
    (route) => route?.fragment ?? null
  );
  queryParams$: Observable<Params | null> = this.select(
    this.#rootRoute$,
    (route) => route?.queryParams ?? null
  );
  routeData$: Observable<Data | null> = this.select(
    this.currentRoute$,
    (route) => route?.data ?? null
  );
  routeParams$: Observable<Params | null> = this.select(
    this.currentRoute$,
    (route) => route?.params ?? null
  );
  routerStoreEvent$: Observable<RouterStoreEvent> =
    this.#routerStoreEvent.asObservable();
  url$: Observable<string | null> = this.select(
    this.#routerState$,
    (routerState) => routerState?.url ?? null
  );

  constructor(
    @Inject(routerStoreConfigToken) private readonly config: RouterStoreConfig,
    private errorHandler: ErrorHandler,
    private router: Router,
    private serializer: RouterStateSerializer<SerializedRouterStateSnapshot>
  ) {
    super(initialState);

    this.#syncNavigationStart(
      this.#selectRouterEvents(NavigationStart).pipe(
        withLatestFrom(this.#trigger$)
      )
    );
    this.#navigateIfNeeded(
      this.#selectRouterEvents(NavigationStart).pipe(
        withLatestFrom(this.#trigger$),
        map(([_, trigger]) => trigger)
      )
    );
    this.#syncRoutesRecognized(
      this.#selectRouterEvents(RoutesRecognized).pipe(
        withLatestFrom(this.#trigger$)
      )
    );
    this.#syncNavigationCancel(this.#selectRouterEvents(NavigationCancel));
    this.#syncNavigationError(this.#selectRouterEvents(NavigationError));

    this.#syncNavigationEnd(
      this.#selectRouterEvents(NavigationEnd).pipe(
        withLatestFrom(this.#trigger$, this.#routesRecognized$)
      )
    );
  }

  #navigateIfNeeded = this.effect<RouterTrigger>((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.url$ as Observable<string>),
      filter(([trigger]) => trigger !== RouterTrigger.ROUTER),
      map(([_, url]) => url),
      filter((url) => url !== null && !isSameUrl(this.router.url, url)),
      tap((url) => {
        this.patchState({
          trigger: RouterTrigger.STORE,
        });

        this.router.navigateByUrl(url).catch((error) => {
          this.errorHandler.handleError(error);
        });
      })
    )
  );

  #syncNavigationCancel = this.effect<NavigationCancel>((navigationCancel$) =>
    navigationCancel$.pipe(
      tap((navigationCancel) => {
        this.#emitRouterStoreCancelEvent(navigationCancel);
        this.#reset();
      })
    )
  );

  #syncNavigationEnd = this.effect<
    [NavigationEnd, RouterTrigger, RoutesRecognized]
  >((sources$) =>
    sources$.pipe(
      tap(([navigationEnd, trigger, routesRecognized]) => {
        if (trigger !== RouterTrigger.STORE) {
          if (this.#dispatchNavLate) {
            this.#emitRouterStoreNavigationEvent(routesRecognized);
          }

          this.#emitRouterStoreNavigatedEvent(navigationEnd);
        }

        this.#reset();
      })
    )
  );

  #syncNavigationError = this.effect<NavigationError>((navigationError$) =>
    navigationError$.pipe(
      tap((navigationError) => {
        this.#emitRouterStoreErrorEvent(navigationError);
        this.#reset();
      })
    )
  );

  #syncNavigationStart = this.effect<[NavigationStart, RouterTrigger]>(
    (sources$) =>
      sources$.pipe(
        tap(([navigationStart, trigger]) => {
          this.patchState({
            routerState: this.serializer.serialize(
              this.router.routerState.snapshot
            ),
          });

          if (trigger !== RouterTrigger.STORE) {
            this.#emitRouterStoreRequestEvent(navigationStart);
          }
        })
      )
  );

  #syncRoutesRecognized = this.effect<[RoutesRecognized, RouterTrigger]>(
    (sources$) =>
      sources$.pipe(
        tap(([routesRecognized, trigger]) => {
          this.patchState({
            routesRecognized,
          });

          if (!this.#dispatchNavLate && trigger !== RouterTrigger.STORE) {
            this.#emitRouterStoreNavigationEvent(routesRecognized);
          }
        })
      )
  );

  #emitRouterStoreCancelEvent(event: NavigationCancel): void {
    this.#emitRouterStoreEvent(routerStoreCancelType, {
      event,
    });
  }

  #emitRouterStoreErrorEvent(event: NavigationError): void {
    this.#emitRouterStoreEvent(routerStoreErrorType, {
      event: new NavigationError(event.id, event.url, `${event}`),
    });
  }

  #emitRouterStoreEvent(
    type: PickTypes<RouterStoreEvent, 'type'>,
    payload: RouterStoreEventPayload
  ): void {
    this.patchState({
      trigger: RouterTrigger.ROUTER,
    });

    try {
      const routerState = this.get((state) => state.routerState);

      if (routerState === null) {
        throw new Error('RouterStoreState#routerState is null');
      }

      const routerStoreEvent: RouterStoreEvent = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: type as any,
        payload: {
          routerState,
          ...payload,
          event:
            this.config.routerState === RouterState.Full
              ? payload.event
              : ({
                  id: payload.event.id,
                  url: payload.event.url,
                  urlAfterRedirects:
                    payload.event instanceof NavigationEnd
                      ? payload.event.urlAfterRedirects
                      : undefined,
                } as RouterEvent &
                  Optional<NavigationEnd, 'urlAfterRedirects'>),
        },
      };

      this.#routerStoreEvent.emit(routerStoreEvent);
      this.patchState({
        navigationId: routerStoreEvent.payload.event.id,
        // TODO(@LayZeeDK): determine whether this is necessary/works
        routerState: routerStoreEvent.payload.routerState,
      });
    } finally {
      this.patchState({
        trigger: RouterTrigger.NONE,
      });
    }
  }

  #emitRouterStoreNavigatedEvent(event: NavigationEnd): void {
    const routerState = this.serializer.serialize(
      this.router.routerState.snapshot
    );
    this.#emitRouterStoreEvent(routerStoreNavigatedType, {
      event,
      routerState,
    });
  }

  #emitRouterStoreNavigationEvent(
    lastRoutesRecognized: RoutesRecognized
  ): void {
    const nextRouterState = this.serializer.serialize(
      lastRoutesRecognized.state
    );

    this.#emitRouterStoreEvent(routerStoreNavigationType, {
      routerState: nextRouterState,
      event: new RoutesRecognized(
        lastRoutesRecognized.id,
        lastRoutesRecognized.url,
        lastRoutesRecognized.urlAfterRedirects,
        nextRouterState
      ),
    });
  }

  #emitRouterStoreRequestEvent(event: NavigationStart): void {
    this.#emitRouterStoreEvent(routerStoreRequestType, {
      event,
    });
  }

  #reset(): void {
    this.patchState({
      routerState: null,
      trigger: RouterTrigger.NONE,
    });
  }

  #selectRouterEvents<TEvent extends AngularRouterEvent>(
    eventType: Type<TEvent>
  ): Observable<TEvent> {
    return (this.router.events as Observable<TEvent>).pipe(
      filter((routerEvent) => routerEvent instanceof eventType)
    );
  }

  selectQueryParam<T>(param: string): Observable<T | undefined> {
    return this.select(this.queryParams$, (params) => params?.[param]);
  }

  selectRouteParam<T>(param: string): Observable<T | undefined> {
    return this.select(this.routeParams$, (params) => params?.[param]);
  }
}

const initialState: RouterStoreState = {
  navigationId: null,
  routerState: null,
  routesRecognized: null,
  trigger: RouterTrigger.NONE,
};
