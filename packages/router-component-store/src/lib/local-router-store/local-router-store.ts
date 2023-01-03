import { inject, Injectable, Type } from '@angular/core';
import {
  ActivatedRoute,
  Data,
  Event as RouterEvent,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Params,
  Router,
  RoutesRecognized,
} from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { map, Observable } from 'rxjs';
import { MinimalActivatedRouteSnapshot } from '../@ngrx/router-store/minimal-activated-route-state-snapshot';
import { MinimalRouterStateSnapshot } from '../@ngrx/router-store/minimal-router-state-snapshot';
import { MinimalRouterStateSerializer } from '../@ngrx/router-store/minimal_serializer';
import { filterRouterEvents } from '../filter-router-event.operator';
import { RouterStore } from '../router-store';

interface LocalRouterState {
  readonly routerState: MinimalRouterStateSnapshot;
}

@Injectable()
export class LocalRouterStore
  extends ComponentStore<LocalRouterState>
  implements RouterStore
{
  #route = inject(ActivatedRoute);
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
  fragment$: Observable<string | null>;
  queryParams$: Observable<Params>;
  routeData$: Observable<Data>;
  routeParams$: Observable<Params>;
  title$: Observable<string | undefined>;
  url$: Observable<string> = this.select(
    this.#routerState$,
    (routerState) => routerState.url
  );

  constructor() {
    super();
    ({
      fragment: this.fragment$,
      queryParams: this.queryParams$,
      data: this.routeData$,
      params: this.routeParams$,
      title: this.title$,
    } = this.#route);
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
    (state, routerState): LocalRouterState => ({
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

  selectRouterEvents<TAcceptedRouterEvents extends Type<RouterEvent>[]>(
    ...acceptedEventTypes: [...TAcceptedRouterEvents]
  ): Observable<InstanceType<TAcceptedRouterEvents[number]>> {
    return this.#router.events.pipe(
      filterRouterEvents(...acceptedEventTypes)
    ) as Observable<InstanceType<TAcceptedRouterEvents[number]>>;
  }
}
