import { inject, Injectable, Type } from '@angular/core';
import {
  Event as RouterEvent,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RoutesRecognized,
} from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { map, Observable } from 'rxjs';
import { MinimalActivatedRouteSnapshot } from '../@ngrx/router-store/minimal-activated-route-state-snapshot';
import { MinimalRouterStateSnapshot } from '../@ngrx/router-store/minimal-router-state-snapshot';
import { MinimalRouterStateSerializer } from '../@ngrx/router-store/minimal_serializer';
import { filterRouterEvents } from '../filter-router-event.operator';
import { InternalStrictQueryParams } from '../internal-strict-query-params';
import { InternalStrictRouteData } from '../internal-strict-route-data';
import { InternalStrictRouteParams } from '../internal-strict-route-params';
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
  queryParams$: Observable<InternalStrictQueryParams> = this.select(
    this.#rootRoute$,
    (route) => route.queryParams
  );
  routeData$: Observable<InternalStrictRouteData> = this.select(
    this.currentRoute$,
    (route) => route.data
  );
  routeParams$: Observable<InternalStrictRouteParams> = this.select(
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
      this.selectRouterEvents(
        NavigationStart,
        RoutesRecognized,
        NavigationEnd,
        NavigationCancel,
        NavigationError
      ).pipe(
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

  selectQueryParam(
    param: string
  ): Observable<string | readonly string[] | undefined> {
    return this.select(this.queryParams$, (params) => params[param]);
  }

  selectRouteData(key: string): Observable<unknown> {
    return this.selectRouteDataParam(key);
  }

  selectRouteDataParam(key: string): Observable<unknown> {
    return this.select(this.routeData$, (data) => data[key]);
  }

  selectRouteParam(param: string): Observable<string | undefined> {
    return this.select(this.routeParams$, (params) => params[param]);
  }

  selectRouterEvents<TAcceptedRouterEvents extends Type<RouterEvent>[]>(
    ...acceptedEventTypes: [...TAcceptedRouterEvents]
  ): Observable<InstanceType<TAcceptedRouterEvents[number]>> {
    return this.#router.events.pipe(
      filterRouterEvents(...acceptedEventTypes)
    ) as Observable<InstanceType<TAcceptedRouterEvents[number]>>;
  }
}
