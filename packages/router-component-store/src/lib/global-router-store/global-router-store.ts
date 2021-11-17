import { Inject, inject, Injectable, InjectFlags, InjectionToken } from '@angular/core';
import { ActivatedRouteSnapshot, Data, Params, Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { MinimalRouterStateSerializer, RouterStateSerializer, SerializedRouterStateSnapshot } from '@ngrx/router-store';
import { map, Observable } from 'rxjs';

interface GlobalRouterStoreState {
  readonly routerState: SerializedRouterStateSnapshot;
}

@Injectable({
  providedIn: 'root',
})
export class GlobalRouterStore extends ComponentStore<GlobalRouterStoreState> {
  #routerState$: Observable<SerializedRouterStateSnapshot> = this.select(
    (state) => state.routerState
  );
  #rootRoute$: Observable<ActivatedRouteSnapshot> = this.select(
    this.#routerState$,
    (routerState) => routerState.root
  );

  currentRoute$ = this.select(this.#rootRoute$, (route) => {
    while (route.firstChild) {
      route = route.firstChild;
    }

    return route;
  });
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

  constructor(
    router: Router,
    @Inject(serializerToken)
    serializer: RouterStateSerializer<SerializedRouterStateSnapshot>
  ) {
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

  #updateRouterState = this.updater<SerializedRouterStateSnapshot>(
    (state, routerState): GlobalRouterStoreState => ({
      ...state,
      routerState,
    })
  );
}

const serializerToken = new InjectionToken<RouterStateSerializer>(
  'serializerToken',
  {
    factory: () =>
      inject(RouterStateSerializer, InjectFlags.Optional) ??
      new MinimalRouterStateSerializer(),
    providedIn: 'root',
  }
);
