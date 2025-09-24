import {
  DestroyRef,
  Injectable,
  Signal,
  WritableSignal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  Router,
  RouterStateSnapshot,
  createUrlTreeFromSnapshot,
} from '@angular/router';
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

@Injectable()
export class LocalRouterStore extends RouterStore {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #serializer = inject(MinimalRouterStateSerializer);
  readonly #destroyRef = inject(DestroyRef);

  readonly #routerStateSignal: WritableSignal<MinimalRouterStateSnapshot> =
    signal(serializeRouterState(this.#route, this.#router, this.#serializer));

  readonly currentRoute = computed(
    (): MinimalActivatedRouteSnapshot => this.#routerStateSignal().root
  );

  readonly fragment: Signal<string | null> = toSignal(this.#route.fragment, {
    requireSync: true,
  });

  readonly queryParams: Signal<StrictQueryParams> = toSignal(
    this.#route.queryParams,
    {
      requireSync: true,
    }
  );

  readonly routeData: Signal<StrictRouteData> = toSignal(this.#route.data, {
    requireSync: true,
  });

  readonly routeParams: Signal<StrictRouteParams> = toSignal(
    this.#route.params,
    {
      requireSync: true,
    }
  );

  readonly title: Signal<string | undefined> = toSignal(this.#route.title, {
    requireSync: true,
  });

  readonly url = computed((): string => this.#routerStateSignal().url);

  constructor() {
    super();

    // Listen to router events to update state
    this.#router.events
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((routerEvent) => {
        if (isNavigationEvent(routerEvent)) {
          const routerState = serializeRouterState(
            this.#route,
            this.#router,
            this.#serializer
          );
          this.#routerStateSignal.set(routerState);
        }
      });
  }

  selectQueryParam(
    param: string
  ): Signal<string | readonly string[] | undefined> {
    return computed(
      () => (this.queryParams() as InternalStrictQueryParams)[param]
    );
  }

  selectRouteDataParam(key: string): Signal<unknown> {
    return computed(() => (this.routeData() as InternalStrictRouteData)[key]);
  }

  selectRouteParam(param: string): Signal<string | undefined> {
    return computed(
      () => (this.routeParams() as InternalStrictRouteParams)[param]
    );
  }
}
