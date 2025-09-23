import { Signal, Type, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  Router,
  RouterStateSnapshot,
  createUrlTreeFromSnapshot,
} from '@angular/router';
import { MinimalActivatedRouteSnapshot } from '@ngrx/router-store';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withState,
} from '@ngrx/signals';
import { MinimalRouterStateSnapshot } from '../@ngrx/router-store/minimal-router-state-snapshot';
import { MinimalRouterStateSerializer } from '../@ngrx/router-store/minimal_serializer';
import { InternalStrictQueryParams } from '../internal-strict-query-params';
import { InternalStrictRouteData } from '../internal-strict-route-data';
import { InternalStrictRouteParams } from '../internal-strict-route-params';
import { isNavigationEvent } from '../is-navigation-event';
import { RouterSignalStore } from '../router-signal-store';
import { withParameterizedSelectors } from '../with-parameterized-selectors';

function createRouterStateSnapshot(
  route: ActivatedRoute,
  router: Router
): RouterStateSnapshot {
  return {
    root: route.snapshot,
    url: router.serializeUrl(
      createUrlTreeFromSnapshot(
        route.snapshot,
        [],
        route.snapshot.queryParams,
        route.snapshot.fragment
      )
    ),
  };
}

function serializeRouterState(
  route: ActivatedRoute,
  router: Router,
  serializer: MinimalRouterStateSerializer
): MinimalRouterStateSnapshot {
  return serializer.serialize(createRouterStateSnapshot(route, router));
}

interface LocalRouterSignalState {
  readonly _routerState: MinimalRouterStateSnapshot;
}

export const LocalRouterSignalStore: Type<RouterSignalStore> = signalStore(
  withState<LocalRouterSignalState>(
    (
      route = inject(ActivatedRoute),
      router = inject(Router),
      serializer = inject(MinimalRouterStateSerializer)
    ) => ({
      _routerState: serializeRouterState(route, router, serializer),
    })
  ),
  withComputed(({ _routerState }, route = inject(ActivatedRoute)) => ({
    currentRoute: computed(
      (): MinimalActivatedRouteSnapshot => _routerState().root
    ),
    fragment: toSignal(route.fragment, {
      requireSync: true,
    }) satisfies Signal<string | null>,
    queryParams: toSignal(route.queryParams, {
      requireSync: true,
    }) satisfies Signal<InternalStrictQueryParams>,
    routeData: toSignal(route.data, {
      requireSync: true,
    }) satisfies Signal<InternalStrictRouteData>,
    routeParams: toSignal(route.params, {
      requireSync: true,
    }) satisfies Signal<InternalStrictRouteParams>,
    title: toSignal(route.title, { requireSync: true }) satisfies Signal<
      string | undefined
    >,
    url: computed((): string => _routerState().url),
  })),
  withParameterizedSelectors(),
  withHooks({
    onInit(
      store,
      route = inject(ActivatedRoute),
      router = inject(Router),
      serializer = inject(MinimalRouterStateSerializer)
    ): void {
      router.events.pipe(takeUntilDestroyed()).subscribe((routerEvent) => {
        if (isNavigationEvent(routerEvent)) {
          const routerState = serializeRouterState(route, router, serializer);

          patchState(store, { _routerState: routerState });
        }
      });
    },
  })
);
