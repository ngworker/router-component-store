import { Inject, inject, Injectable, InjectFlags, InjectionToken } from '@angular/core';
import { ActivatedRoute, Data, Params, Router, RouterStateSnapshot } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { MinimalRouterStateSerializer, RouterStateSerializer, SerializedRouterStateSnapshot } from '@ngrx/router-store';
import { map, Observable } from 'rxjs';

interface LocalRouterStoreState {
  readonly routerState: SerializedRouterStateSnapshot;
}

@Injectable()
export class LocalRouterStore extends ComponentStore<LocalRouterStoreState> {
  currentRoute$ = this.select(
    this.select((state) => state.routerState.root),
    (route) => {
      while (route.firstChild) {
        route = route.firstChild;
      }

      return route;
    }
  );
  fragment$: Observable<string | null> = this.route.fragment;
  queryParams$: Observable<Params> = this.route.queryParams;
  routeData$: Observable<Data> = this.route.data;
  routeParams$: Observable<Params> = this.route.params;
  url$: Observable<string> = this.select((state) => state.routerState.url);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(serializerToken)
    private serializer: RouterStateSerializer<SerializedRouterStateSnapshot>
  ) {
    super({
      routerState: serializer.serialize(router.routerState.snapshot),
    });

    this.#updateRouterState(
      this.router.events.pipe(map(() => this.router.routerState.snapshot))
    );
  }

  selectQueryParam<TValue>(param: string): Observable<TValue> {
    return this.queryParams$.pipe(map((params) => params[param]));
  }

  selectRouteParam<TValue>(param: string): Observable<TValue> {
    return this.routeParams$.pipe(map((params) => params[param]));
  }

  #updateRouterState = this.updater<RouterStateSnapshot>(
    (state, routerState): LocalRouterStoreState => ({
      ...state,
      routerState: this.serializer.serialize(routerState),
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
