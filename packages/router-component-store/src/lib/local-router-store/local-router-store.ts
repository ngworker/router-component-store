import { Inject, inject, Injectable, InjectFlags, InjectionToken } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Data, Params, Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { MinimalRouterStateSerializer, RouterStateSerializer, SerializedRouterStateSnapshot } from '@ngrx/router-store';
import { map, Observable } from 'rxjs';

interface LocalRouterStoreState {
  readonly routerState: SerializedRouterStateSnapshot;
}

@Injectable()
export class LocalRouterStore extends ComponentStore<LocalRouterStoreState> {
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
    @Inject(serializerToken)
    serializer: RouterStateSerializer<SerializedRouterStateSnapshot>
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

  #updateRouterState = this.updater<SerializedRouterStateSnapshot>(
    (state, routerState): LocalRouterStoreState => ({
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
