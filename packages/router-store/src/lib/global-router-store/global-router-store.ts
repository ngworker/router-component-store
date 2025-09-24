import { DestroyRef, Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MinimalActivatedRouteSnapshot } from '../@ngrx/router-store/minimal-activated-route-state-snapshot';
import { MinimalRouterStateSnapshot } from '../@ngrx/router-store/minimal-router-state-snapshot';
import { MinimalRouterStateSerializer } from '../@ngrx/router-store/minimal_serializer';
import { InternalStrictQueryParams } from '../internal-strict-query-params';
import { InternalStrictRouteData } from '../internal-strict-route-data';
import { InternalStrictRouteParams } from '../internal-strict-route-params';
import { isNavigationEvent } from '../is-navigation-event';
import { RouterStore } from '../router-store';
import { StrictQueryParams } from '../strict-query-params';
import { StrictRouteData } from '../strict-route-data';
import { StrictRouteParams } from '../strict-route-params';

@Injectable({
  providedIn: 'root',
})
export class GlobalRouterStore extends RouterStore {
  readonly #router = inject(Router);
  readonly #serializer = inject(MinimalRouterStateSerializer);
  readonly #destroyRef = inject(DestroyRef);

  readonly #routerStateSignal: WritableSignal<MinimalRouterStateSnapshot> = signal(
    this.#serializer.serialize(this.#router.routerState.snapshot)
  );

  readonly #rootRoute = computed(
    (): MinimalActivatedRouteSnapshot => this.#routerStateSignal().root
  );

  readonly currentRoute = computed((): MinimalActivatedRouteSnapshot => {
    let route = this.#rootRoute();

    while (route.firstChild) {
      route = route.firstChild;
    }

    return route;
  });

  readonly fragment = computed((): string | null => this.#rootRoute().fragment);

  readonly queryParams = computed(
    (): StrictQueryParams => this.#rootRoute().queryParams
  );

  readonly routeData = computed(
    (): StrictRouteData => this.currentRoute().data
  );

  readonly routeParams = computed(
    (): StrictRouteParams => this.currentRoute().params
  );

  readonly title = computed(
    (): string | undefined => this.currentRoute().title
  );

  readonly url = computed((): string => this.#routerStateSignal().url);

  constructor() {
    super();

    // Listen to router events to update state
    this.#router.events.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((routerEvent) => {
      if (isNavigationEvent(routerEvent)) {
        const routerState = this.#serializer.serialize(this.#router.routerState.snapshot);
        this.#routerStateSignal.set(routerState);
      }
    });
  }

  selectQueryParam(
    param: string
  ): Signal<string | readonly string[] | undefined> {
    return computed(() => (this.queryParams() as InternalStrictQueryParams)[param]);
  }

  selectRouteDataParam(key: string): Signal<unknown> {
    return computed(() => (this.routeData() as InternalStrictRouteData)[key]);
  }

  selectRouteParam(param: string): Signal<string | undefined> {
    return computed(() => (this.routeParams() as InternalStrictRouteParams)[param]);
  }
}