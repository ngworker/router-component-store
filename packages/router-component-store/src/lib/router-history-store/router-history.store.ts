import { inject, Injectable, Provider } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { ComponentStore, provideComponentStore } from '@ngrx/component-store';
import { filter, Observable } from 'rxjs';

interface RouterHistoryState {
  readonly history: NavigationHistory;
}

type CompleteNavigation = readonly [NavigationStart, NavigationEnd];
type NavigationHistory = Record<number, NavigationSequence>;
type NavigationSequence = PendingNavigation | CompleteNavigation;
type PendingNavigation = readonly [NavigationStart];

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

  #history$ = this.select((state) => state.history).pipe(
    filter((history) => Object.keys(history).length > 0)
  );
  #navigationEnd$: Observable<NavigationEnd> = this.#router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd)
  );
  #navigationStart$: Observable<NavigationStart> = this.#router.events.pipe(
    filter(
      (event): event is NavigationStart => event instanceof NavigationStart
    )
  );

  #maxCompletedNavigationId$ = this.select(this.#history$, (history) =>
    Number(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      Object.entries(history)
        .reverse()
        .find(([, navigation]) => navigation.length === 2)![0]
    )
  );
  #latestCompletedNavigation$ = this.select(
    this.#maxCompletedNavigationId$,
    this.#history$,
    (maxCompletedNavigationId, history) =>
      history[maxCompletedNavigationId] as CompleteNavigation,
    {
      debounce: true,
    }
  );

  currentUrl$: Observable<string> = this.select(
    this.#latestCompletedNavigation$,
    ([, end]) => end.urlAfterRedirects
  );
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

  #addNavigationEnd = this.updater<NavigationEnd>(
    (state, event): RouterHistoryState => ({
      ...state,
      history: {
        ...state.history,
        [event.id]: [state.history[event.id][0], event],
      },
    })
  );

  #addNavigationStart = this.updater<NavigationStart>(
    (state, event): RouterHistoryState => ({
      ...state,
      history: {
        ...state.history,
        [event.id]: [event],
      },
    })
  );

  #getNavigationSource(
    navigationId: number,
    history: NavigationHistory
  ): CompleteNavigation {
    let navigation = history[navigationId];

    while (navigation[0].navigationTrigger === 'popstate') {
      navigation =
        history[
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          navigation[0].restoredState!.navigationId
        ];
      navigationId = navigation[0].id;
    }

    return navigation as CompleteNavigation;
  }
}

export const initialState: RouterHistoryState = {
  history: [],
};
