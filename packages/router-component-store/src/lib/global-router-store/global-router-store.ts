import { inject, Injectable } from '@angular/core';
import { Data, Params, Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { map, Observable } from 'rxjs';
import { MinimalActivatedRouteSnapshot } from '../@ngrx/router-store/minimal-activated-route-state-snapshot';
import { MinimalRouterStateSnapshot } from '../@ngrx/router-store/minimal-router-state-snapshot';
import { MinimalRouterStateSerializer } from '../@ngrx/router-store/minimal_serializer';
import { RouterStore } from '../router-store';

interface GlobalRouterState {
  readonly routerState: MinimalRouterStateSnapshot;
}

@Injectable()
export class GlobalRouterStore
  extends ComponentStore<GlobalRouterState>
  implements RouterStore
{
  #router = inject(Router);
  #serializer = inject(MinimalRouterStateSerializer);

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
  title$: Observable<string | undefined> = this.select(
    this.currentRoute$,
    (route) => route.title
  );
  url$: Observable<string> = this.select(
    this.#routerState$,
    (routerState) => routerState.url
  );

  constructor() {
    super();
    this.setState({
      routerState: this.#serializer.serialize(
        this.#router.routerState.snapshot
      ),
    });

    this.#updateRouterState(
      this.#router.events.pipe(
        map(() => this.#serializer.serialize(this.#router.routerState.snapshot))
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
