import {
  APP_INITIALIZER,
  FactoryProvider,
  inject,
  Injectable,
  Provider,
} from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { ComponentStore, provideComponentStore } from '@ngrx/component-store';
import { filter, Observable } from 'rxjs';

interface RouterHistoryState {
  /**
   * The history of all navigations.
   */
  readonly history: NavigationHistory;
}

type CompleteNavigation = readonly [NavigationStart, NavigationEnd];
type NavigationHistory = Record<number, NavigationSequence>;
type NavigationSequence = PendingNavigation | CompleteNavigation;
type PendingNavigation = readonly [NavigationStart];

/**
 * Provide and initialize the `RouterHistoryStore`.
 *
 * @remarks
 * Must be provided by the root injector to capture all navigation events.
 */
export function provideRouterHistoryStore(): Provider[] {
  return [
    provideComponentStore(RouterHistoryStore),
    routerHistoryStoreInitializer,
  ];
}

// TODO(@LayZeeDK): Handle `NavigationCancel` and `NavigationError` events
// NavigationStart -> NavigationEnd | NavigationCancel | NavigationError
//
// NavigationError resets the URL to what it was before the navigation that caused an error. No new *navigation* is triggered.
// NavigationError reasons:
// - Invalid route path
//   NavigationError(id: 3, url: '/an-invalid/path', error: Error: Cannot match any routes. URL Segment: 'an-invalid/path')
// - Router resolver throws
// - Route matcher throws
// - Routed component throws in constructor (or a lifecycle hook?)
// - Lazy route chunk file is not found (bundles updated and the user needs to refresh)
//   RouterTestingModule.withRoutes([
//     {
//       path: 'stale-chunk',
//       loadChildren: () =>
//         Promise.reject({ name: 'ChunkLoadError', message: 'ChunkLoadError' }),
//         // or () => { throw { name: 'ChunkLoadError', message: 'ChunkLoadError' }; }
//     },
//   ]),
//
// What is the URL after each of the following reasons?
// NavigationCancel reasons:
// NavigationCancel#code: NavigationCancellationCode
// - GuardRejected: A navigation failed because a guard returned `false`.
// - NoDataFromResolver: A navigation failed because one of the resolvers completed without emiting a value.
// - Redirect: A navigation failed because a guard returned a `UrlTree` to redirect.
// - SupersededByNewNavigation: A navigation failed because a more recent navigation started.
//   NavigationCancel { id: 3, url: "/company", reason: "Navigation ID 3 is not equal to the current navigation id 4" }

@Injectable()
export class RouterHistoryStore extends ComponentStore<RouterHistoryState> {
  #router = inject(Router);

  /**
   * The history of all navigations.
   */
  #history$ = this.select((state) => state.history).pipe(
    filter((history) => Object.keys(history).length > 0)
  );
  /**
   * All `NavigationEnd` events.
   */
  #navigationEnd$: Observable<NavigationEnd> = this.#router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd)
  );
  /**
   * All `NavigationStart` events.
   */
  #navigationStart$: Observable<NavigationStart> = this.#router.events.pipe(
    filter(
      (event): event is NavigationStart => event instanceof NavigationStart
    )
  );

  /**
   * The navigation ID of the most recent completed navigation.
   */
  #maxCompletedNavigationId$ = this.select(
    this.#history$.pipe(filter((history) => (history[1] ?? []).length > 1)),
    (history) =>
      Number(
        // This callback is only triggered when at least one navigation has
        // completed
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        Object.entries(history)
          .reverse()
          .find(([, navigation]) => navigation.length === 2)![0]
      )
  );
  /**
   * The most recent completed navigation.
   */
  #latestCompletedNavigation$ = this.select(
    this.#maxCompletedNavigationId$,
    this.#history$,
    (maxCompletedNavigationId, history) =>
      history[maxCompletedNavigationId] as CompleteNavigation,
    {
      debounce: true,
    }
  );

  /**
   * The current URL.
   */
  currentUrl$: Observable<string> = this.select(
    this.#latestCompletedNavigation$,
    ([, end]) => end.urlAfterRedirects
  );
  /**
   * The previous URL when taking `popstate` events into account.
   *
   * `undefined` is emitted when the current navigation is the first in the
   * navigation history.
   */
  previousUrl$: Observable<string | undefined> = this.select(
    this.#history$,
    this.#maxCompletedNavigationId$,
    (history, maxCompletedNavigationId) => {
      if (maxCompletedNavigationId === 1) {
        return undefined;
      }

      const [completedNavigationSourceStart] = this.#getNavigationSource(
        maxCompletedNavigationId,
        history
      );

      if (completedNavigationSourceStart.id === 1) {
        return undefined;
      }

      const previousNavigationId = completedNavigationSourceStart.id - 1;
      const [, previousNavigationSourceEnd] = this.#getNavigationSource(
        previousNavigationId,
        history
      );

      return previousNavigationSourceEnd.urlAfterRedirects;
    },
    {
      debounce: true,
    }
  );

  constructor() {
    super(initialState);

    this.#addNavigationStart(this.#navigationStart$);
    this.#addNavigationEnd(this.#navigationEnd$);
  }

  /**
   * Add a `NavigationEnd` event to the navigation history.
   */
  #addNavigationEnd = this.updater<NavigationEnd>(
    (state, event): RouterHistoryState => ({
      ...state,
      history: {
        ...state.history,
        [event.id]: [state.history[event.id][0], event],
      },
    })
  );

  /**
   * Add a `NavigationStart` event to the navigation history.
   */
  #addNavigationStart = this.updater<NavigationStart>(
    (state, event): RouterHistoryState => ({
      ...state,
      history: {
        ...state.history,
        [event.id]: [event],
      },
    })
  );

  /**
   * Search the specified navigation history to find the source of the
   * specified navigation event.
   *
   * This takes `popstate` navigation events into account.
   *
   * @param navigationId The ID of the navigation to trace.
   * @param history The navigation history to search.
   * @returns The source navigation.
   */
  #getNavigationSource(
    navigationId: number,
    history: NavigationHistory
  ): CompleteNavigation {
    let navigation = history[navigationId];

    while (navigation[0].navigationTrigger === 'popstate') {
      navigation =
        history[
          // Navigation events triggered by `popstate` always have a
          // `restoredState`
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          navigation[0].restoredState!.navigationId
        ];
    }

    return navigation as CompleteNavigation;
  }
}

/**
 * The initial internal state of the `RouterHistoryStore`.
 */
const initialState: RouterHistoryState = {
  history: [],
};

const initializeRouterHistoryStoreFactory =
  // Inject the RouterHistoryStore to eagerly initialize it.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_initializedRouterHistoryStore: RouterHistoryStore) => (): void => undefined;
/**
 * Eagerly initialize the `RouterHistoryStore` to subscribe to all relevant
 * router navigation events.
 */
const routerHistoryStoreInitializer: FactoryProvider = {
  provide: APP_INITIALIZER,
  multi: true,
  deps: [RouterHistoryStore],
  useFactory:
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    initializeRouterHistoryStoreFactory,
};
