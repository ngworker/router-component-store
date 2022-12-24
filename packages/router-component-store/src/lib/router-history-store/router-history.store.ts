import { inject, Injectable, Provider } from '@angular/core';
import {
  Navigation,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
import { ComponentStore, provideComponentStore } from '@ngrx/component-store';
import { concatMap, filter, Observable, take } from 'rxjs';

interface RouterHistoryRecord {
  readonly id: number;
  readonly url: string;
}

interface RouterHistoryState {
  readonly currentIndex: number;
  readonly event?: NavigationStart | NavigationEnd;
  readonly history: readonly RouterHistoryRecord[];
  readonly id: number;
  readonly idToRestore?: number;
  readonly trigger?: Navigation['trigger'];
}

export function provideRouterHistoryStore(): Provider[] {
  return [provideComponentStore(RouterHistoryStore)];
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

  #currentIndex$: Observable<number> = this.select(
    (state) => state.currentIndex
  );
  #history$: Observable<readonly RouterHistoryRecord[]> = this.select(
    (state) => state.history
  );
  #navigationEnd$: Observable<NavigationEnd> = this.#router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd)
  );
  #navigationStart$: Observable<NavigationStart> = this.#router.events.pipe(
    filter(
      (event): event is NavigationStart => event instanceof NavigationStart
    )
  );
  #imperativeNavigationEnd$: Observable<NavigationEnd> =
    this.#navigationStart$.pipe(
      filter((event) => event.navigationTrigger === 'imperative'),
      concatMap(() => this.#navigationEnd$.pipe(take(1)))
    );
  #popstateNavigationEnd$: Observable<NavigationEnd> =
    this.#navigationStart$.pipe(
      filter((event) => event.navigationTrigger === 'popstate'),
      concatMap(() => this.#navigationEnd$.pipe(take(1)))
    );

  currentUrl$: Observable<string> = this.select(
    this.#navigationEnd$.pipe(
      concatMap(() =>
        this.select(
          this.#currentIndex$,
          this.#history$,
          (currentIndex, history) => [currentIndex, history] as const
        )
      )
    ),
    ([currentIndex, history]) => history[currentIndex].url,
    {
      debounce: true,
    }
  );
  previousUrl$: Observable<string | null> = this.select(
    this.#navigationEnd$.pipe(
      concatMap(() =>
        this.select(
          this.#currentIndex$,
          this.#history$,
          (currentIndex, history) => [currentIndex, history] as const
        )
      )
    ),
    ([currentIndex, history]) => history[currentIndex - 1]?.url ?? null,
    {
      debounce: true,
    }
  );

  constructor() {
    super(initialState);

    this.#updateRouterHistoryOnNavigationStart(this.#navigationStart$);
    this.#updateRouterHistoryOnImperativeNavigationEnd(
      this.#imperativeNavigationEnd$
    );
    this.#updateRouterHistoryOnPopstateNavigationEnd(
      this.#popstateNavigationEnd$
    );
  }

  /**
   * Update router history on imperative navigation end (`Router#navigate`,
   * `Router#navigateByUrl`, or `RouterLink` click).
   */
  #updateRouterHistoryOnImperativeNavigationEnd = this.updater<NavigationEnd>(
    (state, event): RouterHistoryState => {
      let currentIndex = state.currentIndex;
      let history = state.history;
      // remove all events in history that come after the current index
      history = [
        ...history.slice(0, currentIndex + 1),
        // add the new event to the end of the history
        {
          id: state.id,
          url: event.urlAfterRedirects,
        },
      ];
      // set the new event as our current history index
      currentIndex = history.length - 1;

      return {
        ...state,
        currentIndex,
        event,
        history,
      };
    }
  );

  #updateRouterHistoryOnNavigationStart = this.updater<NavigationStart>(
    (state, event): RouterHistoryState => ({
      ...state,
      id: event.id,
      idToRestore: event.restoredState?.navigationId ?? undefined,
      event,
      trigger: event.navigationTrigger,
    })
  );

  /**
   * Update router history on browser navigation end (back, forward, and other
   * `popstate` or `pushstate` events).
   */
  #updateRouterHistoryOnPopstateNavigationEnd = this.updater<NavigationEnd>(
    (state, event): RouterHistoryState => {
      let currentIndex = 0;
      let { history } = state;
      // get the history item that references the idToRestore
      const historyIndexToRestore = history.findIndex(
        (historyRecord) => historyRecord.id === state.idToRestore
      );

      // if found, set the current index to that history item and update the id
      if (historyIndexToRestore > -1) {
        currentIndex = historyIndexToRestore;
        history = [
          ...history.slice(0, historyIndexToRestore),
          {
            ...history[historyIndexToRestore],
            id: state.id,
          },
          ...history.slice(historyIndexToRestore + 1),
        ];
      }

      return {
        ...state,
        currentIndex,
        event,
        history,
      };
    }
  );
}

export const initialState: RouterHistoryState = {
  currentIndex: 0,
  event: undefined,
  history: [],
  id: 0,
  idToRestore: 0,
  trigger: undefined,
};
