import { Injectable, Type } from '@angular/core';
import { ActivatedRouteSnapshot, Data, Event as AngularRouterEvent, NavigationStart, Params, Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { BaseRouterStoreState, RouterStateSerializer, SerializedRouterStateSnapshot } from '@ngrx/router-store';
import { filter, map, Observable, skipWhile, tap, withLatestFrom } from 'rxjs';

import { RouterTrigger } from './router-store/router_store_module';

type RouterState<
  TRouterState extends BaseRouterStoreState = SerializedRouterStateSnapshot
> = {
  readonly lastEvent: AngularRouterEvent | null;
  readonly navigationId: number | null;
  readonly state: TRouterState | null;
  readonly trigger: RouterTrigger;
};

@Injectable({
  providedIn: 'root',
})
export class RouterStore extends ComponentStore<RouterState> {
  #routerState$: Observable<SerializedRouterStateSnapshot> = this.select(
    (state) => state.state as SerializedRouterStateSnapshot
  ).pipe(skipWhile((routerState) => routerState === null));
  #rootRoute$: Observable<ActivatedRouteSnapshot> = this.select(
    this.#routerState$,
    (routerState) => routerState?.root
  );
  #trigger$: Observable<RouterTrigger> = this.select(
    (state) => state.trigger as RouterTrigger
  ).pipe(skipWhile((trigger) => trigger === null));
  #navigationStartTrigger$: Observable<RouterTrigger> =
    this.#selectRouterEvents(NavigationStart).pipe(
      withLatestFrom(this.#trigger$),
      map(([_, trigger]) => trigger)
    );

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
    private router: Router,
    // TODO(@LayZeeDK): provide serializer
    private serializer: RouterStateSerializer<SerializedRouterStateSnapshot>
  ) {
    super(initialState);

    this.#syncRouterState(this.#navigationStartTrigger$);
  }

  selectQueryParam<T>(param: string): Observable<T | undefined> {
    return this.select(this.queryParams$, (params) => params?.[param]);
  }

  selectRouteParam<T>(param: string): Observable<T | undefined> {
    return this.select(this.routeParams$, (params) => params?.[param]);
  }

  #selectRouterEvents<TEvent extends AngularRouterEvent>(
    eventType: Type<TEvent>
  ): Observable<TEvent> {
    return (this.router.events as Observable<TEvent>).pipe(
      filter((routerEvent) => routerEvent instanceof eventType)
    );
  }

  #syncRouterState = this.effect<RouterTrigger>((trigger$) =>
    trigger$.pipe(
      tap((trigger) => {
        this.patchState({
          state: this.serializer.serialize(this.router.routerState.snapshot),
        });

        if (trigger !== RouterTrigger.STORE) {
          // TODO(@LayZeeDK): implement equivalent API
          // this.dispatchRouterRequest(event);
        }
      })
    )
  );
}

const initialState: RouterState = {
  lastEvent: null,
  navigationId: null,
  state: null,
  trigger: RouterTrigger.NONE,
};
