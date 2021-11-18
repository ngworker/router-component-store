import { Injectable } from '@angular/core';
import { Data, Params, Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { map, Observable } from 'rxjs';

import {
  MinimalActivatedRouteSnapshot,
  MinimalRouterStateSerializer,
  MinimalRouterStateSnapshot,
} from '../@ngrx/router-store/minimal_serializer';

interface GlobalRouterStoreState {
  readonly routerState: MinimalRouterStateSnapshot;
}

@Injectable({
  providedIn: 'root',
})
export class GlobalRouterStore extends ComponentStore<GlobalRouterStoreState> {
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
  fragment$: Observable<string | null> = this.select(
    this.#rootRoute$,
    (route) => route.fragment
  );
  queryParams$: Observable<Params> = this.select(
    this.#rootRoute$,
    (route) => route.queryParams
  );
  routeData$: Observable<Data> = this.select(
    this.currentRoute$,
    (route) => route.data
  );
  routeParams$: Observable<Params> = this.select(
    this.currentRoute$,
    (route) => route.params
  );
  url$: Observable<string> = this.select(
    this.#routerState$,
    (routerState) => routerState.url
  );

  constructor(router: Router, serializer: MinimalRouterStateSerializer) {
    super({
      routerState: serializer.serialize(router.routerState.snapshot),
    });

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
    (state, routerState): GlobalRouterStoreState => ({
      ...state,
      routerState,
    })
  );
}
