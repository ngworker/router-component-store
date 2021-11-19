import { Injectable, Injector } from '@angular/core';
import { ActivatedRoute, Data, Params, Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { map, Observable } from 'rxjs';

import {
  MinimalActivatedRouteSnapshot,
  MinimalRouterStateSerializer,
  MinimalRouterStateSnapshot,
} from '../@ngrx/router-store/minimal_serializer';
import { RouterComponentStore } from '../router-component-store';

interface LocalRouterState {
  readonly routerState: MinimalRouterStateSnapshot;
}

export function createLocalRouterStore(
  injector: Injector
): LocalRouterComponentStore {
  return Injector.create({
    name: 'LocalRouterStoreInjector',
    parent: injector,
    providers: [
      {
        provide: LocalRouterComponentStore,
        useClass: LocalRouterComponentStore,
      },
    ],
  }).get(LocalRouterComponentStore);
}

@Injectable()
export class LocalRouterComponentStore
  extends ComponentStore<LocalRouterState>
  implements RouterComponentStore
{
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
    return this.select(this.queryParams$, (params) => params[param]);
  }

  selectRouteParam<TValue>(param: string): Observable<TValue> {
    return this.select(this.routeParams$, (params) => params[param]);
  }

  #updateRouterState = this.updater<MinimalRouterStateSnapshot>(
    (state, routerState): LocalRouterState => ({
      ...state,
      routerState,
    })
  );
}
