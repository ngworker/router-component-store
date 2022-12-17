import { Injectable } from '@angular/core';
import { Data, Params, Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { map, Observable } from 'rxjs';
import {
  MinimalActivatedRouteSnapshot,
  MinimalRouterStateSerializer,
  MinimalRouterStateSnapshot,
} from '../@ngrx/router-store/minimal_serializer';
import { RouterStore } from '../router-store';

interface GlobalRouterState {
  readonly routerState: MinimalRouterStateSnapshot;
}

@Injectable()
export class GlobalRouterStore
  extends ComponentStore<GlobalRouterState>
  implements RouterStore
{
  #routerState$: Observable<MinimalRouterStateSnapshot> = this.select(
    (state) => state.routerState
  );
  #rootRoute$: Observable<MinimalActivatedRouteSnapshot> = this.select(
    this.#routerState$,
    (routerState) => routerState.root
  );

  readonly currentRoute$: Observable<MinimalActivatedRouteSnapshot> =
    this.select(this.#rootRoute$, (route) => {
      while (route.firstChild) {
        route = route.firstChild;
      }

      return route;
    });
  readonly fragment$: Observable<string | null> = this.select(
    this.#rootRoute$,
    (route) => route.fragment
  );
  readonly queryParams$: Observable<Params> = this.select(
    this.#rootRoute$,
    (route) => route.queryParams
  );
  readonly routeData$: Observable<Data> = this.select(
    this.currentRoute$,
    (route) => route.data
  );
  readonly routeParams$: Observable<Params> = this.select(
    this.currentRoute$,
    (route) => route.params
  );
  readonly url$: Observable<string> = this.select(
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

  #updateRouterState = this.updater<MinimalRouterStateSnapshot>(
    (state, routerState): GlobalRouterState => ({
      ...state,
      routerState,
    })
  );

  selectQueryParam(param: string): Observable<string | undefined> {
    return this.select(this.queryParams$, (params) => params[param]);
  }

  selectRouteData<TValue>(key: string): Observable<TValue | undefined> {
    return this.select(this.routeData$, (data) => data[key]);
  }

  selectRouteParam(param: string): Observable<string | undefined> {
    return this.select(this.routeParams$, (params) => params[param]);
  }
}
