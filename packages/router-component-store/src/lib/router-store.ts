import { ErrorHandler, Inject, Injectable, Type } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Data,
  Event as AngularRouterEvent,
  NavigationCancel,
  NavigationStart,
  Params,
  Router,
  RoutesRecognized,
} from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import {
  BaseRouterStoreState,
  NavigationActionTiming,
  RouterStateSerializer,
  SerializedRouterStateSnapshot,
} from '@ngrx/router-store';
import { filter, map, Observable, skipWhile, tap, withLatestFrom } from 'rxjs';

import { RouterStoreConfig, routerStoreConfigToken } from './router-store-config';
import { isSameUrl, RouterTrigger } from './router-store/router_store_module';

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
  #routerState$: Observable<SerializedRouterStateSnapshot> = this.select(
    (state) => state.routerState as SerializedRouterStateSnapshot
  ).pipe(skipWhile((routerState) => routerState === null));
  #rootRoute$: Observable<ActivatedRouteSnapshot> = this.select(
    this.#routerState$,
    (routerState) => routerState?.root
  );
  #trigger$: Observable<RouterTrigger> = this.select(
    (state) => state.trigger as RouterTrigger
  ).pipe(skipWhile((trigger) => trigger === null));

  // TODO(@LayZeeDK): determine whether we need to add `undefined` to the type of
  //   the public selectors depending on the final type of `#routerState$`

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
    (route) => route?.fragment
  );
  queryParams$: Observable<Params> = this.select(
    this.#rootRoute$,
    (route) => route?.queryParams
  );
  routeData$: Observable<Data | undefined> = this.select(
    this.currentRoute$,
    (route) => route?.data
  );
  routeParams$: Observable<Params | undefined> = this.select(
    this.currentRoute$,
    (route) => route?.params
  );
  url$: Observable<string> = this.select(
    this.#routerState$,
    (routerState) => routerState?.url
  );

  constructor(
    @Inject(routerStoreConfigToken) private readonly config: RouterStoreConfig,
    private errorHandler: ErrorHandler,
    private router: Router,
    private serializer: RouterStateSerializer<SerializedRouterStateSnapshot>
  ) {
    super(initialState);

    this.#syncRouterState(
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
  }

  #navigateIfNeeded = this.effect<RouterTrigger>((trigger$) =>
    trigger$.pipe(
      filter((trigger) => trigger !== RouterTrigger.ROUTER),
      withLatestFrom(this.url$),
      map(([_, url]) => url),
      filter((url) => !isSameUrl(this.router.url, url)),
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

  #syncRouterState = this.effect<[NavigationStart, RouterTrigger]>((sources$) =>
    sources$.pipe(
      tap(([navigationStart, trigger]) => {
        this.patchState({
          routerState: this.serializer.serialize(
            this.router.routerState.snapshot
          ),
        });

        if (trigger !== RouterTrigger.STORE) {
          // TODO(@LayZeeDK): implement equivalent API
          // this.dispatchRouterRequest(navigationStart);
        }
      })
    )
  );

  #syncNavigationCancel = this.effect<NavigationCancel>((navigationCancel$) =>
    navigationCancel$.pipe(
      tap((navigationCancel) => {
        // TODO(@LayZeeDK): implement equivalent API
        // this.dispatchRouterCancel(navigationCancel);
        this.#reset();
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

          const dispatchNavLate =
            this.config.navigationActionTiming ===
            NavigationActionTiming.PostActivation;

          if (!dispatchNavLate && trigger !== RouterTrigger.STORE) {
            // TODO(@LayZeeDK): implement equivalent API
            // this.dispatchRouterNavigation(routesRecognized);
          }
        })
      )
  );

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
