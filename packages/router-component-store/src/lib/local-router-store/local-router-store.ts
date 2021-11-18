import { Injectable } from '@angular/core';
import { ActivatedRoute, Data, Params, Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { map, Observable } from 'rxjs';

import {
  MinimalActivatedRouteSnapshot,
  MinimalRouterStateSerializer,
  MinimalRouterStateSnapshot,
} from '../@ngrx/router-store/minimal_serializer';

interface LocalRouterStoreState {
  readonly routerState: MinimalRouterStateSnapshot;
}

@Injectable()
export class LocalRouterStore extends ComponentStore<LocalRouterStoreState> {
  #routerState$: Observable<MinimalRouterStateSnapshot> = this.select(
    (state) => state.routerState
  );
  #rootRoute$: Observable<MinimalActivatedRouteSnapshot> = this.select(
    this.#routerState$,
    (routerState) => routerState.root
  );

  currentRoute$: Observable<MinimalActivatedRouteSnapshot> = this.select(
    this.#rootRoute$,
    (route) => {
      while (route.firstChild) {
        route = route.firstChild;
      }

      return route;
    }
  );
  fragment$: Observable<string | null>;
  queryParams$: Observable<Params>;
  routeData$: Observable<Data>;
  routeParams$: Observable<Params>;
  url$: Observable<string> = this.select(
    this.#routerState$,
    (routerState) => routerState.url
  );

  constructor(
    route: ActivatedRoute,
    router: Router,
    serializer: MinimalRouterStateSerializer
  ) {
    super({
      routerState: serializer.serialize(router.routerState.snapshot),
    });

    this.fragment$ = route.fragment;
    this.queryParams$ = route.queryParams;
    this.routeData$ = route.data;
    this.routeParams$ = route.params;

    this.#updateRouterState(
      router.events.pipe(
        map(() => serializer.serialize(router.routerState.snapshot))
      )
    );
  }

  selectQueryParam<TValue>(param: string): Observable<TValue> {
    return this.queryParams$.pipe(map((params) => params[param]));
  }

  selectRouteParam<TValue>(param: string): Observable<TValue> {
    return this.routeParams$.pipe(map((params) => params[param]));
  }

  #updateRouterState = this.updater<MinimalRouterStateSnapshot>(
    (state, routerState): LocalRouterStoreState => ({
      ...state,
      routerState,
    })
  );
}
