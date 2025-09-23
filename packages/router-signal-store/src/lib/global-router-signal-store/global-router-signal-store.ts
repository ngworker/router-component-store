import { InjectionToken, Type, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withState,
} from '@ngrx/signals';
import { MinimalActivatedRouteSnapshot } from '../@ngrx/router-store/minimal-activated-route-state-snapshot';
import { MinimalRouterStateSnapshot } from '../@ngrx/router-store/minimal-router-state-snapshot';
import { MinimalRouterStateSerializer } from '../@ngrx/router-store/minimal_serializer';
import { InternalStrictQueryParams } from '../internal-strict-query-params';
import { InternalStrictRouteData } from '../internal-strict-route-data';
import { InternalStrictRouteParams } from '../internal-strict-route-params';
import { isNavigationEvent } from '../is-navigation-event';
import { RouterSignalStore } from '../router-signal-store';
import { withParameterizedSelectors } from '../with-parameterized-selectors';

interface GlobalRouterSignalState {
  readonly _routerState: MinimalRouterStateSnapshot;
}

function createInitialGlobalRouterSignalState(): GlobalRouterSignalState {
  const router = inject(Router);
  const serializer = inject(MinimalRouterStateSerializer);

  return {
    _routerState: serializer.serialize(router.routerState.snapshot),
  };
}

const initialGlobalRouterSignalStateToken =
  new InjectionToken<GlobalRouterSignalState>(
    'initialGlobalRouterSignalStateToken',
    {
      factory: createInitialGlobalRouterSignalState,
    }
  );

export const GlobalRouterSignalStore: Type<RouterSignalStore> = signalStore(
  withState<GlobalRouterSignalState>(() =>
    inject(initialGlobalRouterSignalStateToken)
  ),
  withComputed(({ _routerState }) => ({
    _rootRoute: computed(
      (): MinimalActivatedRouteSnapshot => _routerState().root
    ),
  })),
  withComputed(({ _rootRoute }) => ({
    currentRoute: computed((): MinimalActivatedRouteSnapshot => {
      let route = _rootRoute();

      while (route.firstChild) {
        route = route.firstChild;
      }

      return route;
    }),
  })),
  withComputed(({ _rootRoute, _routerState, currentRoute }) => ({
    fragment: computed((): string | null => _rootRoute().fragment),
    queryParams: computed(
      (): InternalStrictQueryParams => _rootRoute().queryParams
    ),
    routeData: computed((): InternalStrictRouteData => currentRoute().data),
    routeParams: computed(
      (): InternalStrictRouteParams => currentRoute().params
    ),
    title: computed((): string | undefined => currentRoute().title),
    url: computed((): string => _routerState().url),
  })),
  withParameterizedSelectors(),
  withHooks({
    onInit(
      store,
      router = inject(Router),
      serializer = inject(MinimalRouterStateSerializer)
    ): void {
      router.events.pipe(takeUntilDestroyed()).subscribe((routerEvent) => {
        if (isNavigationEvent(routerEvent)) {
          const routerState = serializer.serialize(router.routerState.snapshot);

          patchState(store, { _routerState: routerState });
        }
      });
    },
  })
);
