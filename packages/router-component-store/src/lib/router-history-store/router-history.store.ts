import { Location as NgLocation } from '@angular/common';
import {
  APP_INITIALIZER,
  EnvironmentProviders,
  FactoryProvider,
  inject,
  Injectable,
  makeEnvironmentProviders,
} from '@angular/core';
import {
  Event as NgRouterEvent,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { filter, map, Observable, pipe, switchMap, take, tap } from 'rxjs';
import { filterRouterEvents } from '../filter-router-event.operator';
import { isPopstateNavigationStart } from './popstate-navigation-start';
import {
  isRouterNavigatedSequence,
  RouterNavigatedSequence,
  RouterSequence,
} from './router-sequence';

/**
 * A history of router navigated sequences.
 *
 * The key is the navigation ID.
 */
type RouterHistory = Readonly<Record<number, RouterNavigatedSequence>>;
interface RouterHistoryState {
  /**
   * The history of all router navigated sequences.
   *
   * The key is the navigation ID.
   */
  readonly history: RouterHistory;
  /**
   * The ID of the most recent router navigated sequence events.
   */
  readonly maxNavigatedId?: number;
}

/**
 * Provide and initialize the `RouterHistoryStore`.
 *
 * @remarks
 * Must be provided by the root injector to capture all navigation events.
 */
export function provideRouterHistoryStore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    RouterHistoryStore,
    routerHistoryStoreInitializer,
  ]);
}

@Injectable()
export class RouterHistoryStore extends ComponentStore<RouterHistoryState> {
  #location = inject(NgLocation);
  #router = inject(Router);

  /**
   * The history of all navigations.
   */
  #history$ = this.select((state) => state.history).pipe(
    filter((history) => Object.keys(history).length > 0)
  );
  #maxNavigatedId$ = this.select((state) => state.maxNavigatedId).pipe(
    filter(
      (maxNavigatedId): maxNavigatedId is number => maxNavigatedId !== undefined
    )
  );

  /**
   * All router events.
   */
  #routerEvent$: Observable<NgRouterEvent> = this.select(
    this.#router.events,
    (events) => events
  );
  /**
   * All router events concluding a router sequence.
   */
  #navigationResult$: Observable<
    NavigationEnd | NavigationCancel | NavigationError
  > = this.#routerEvent$.pipe(
    filterRouterEvents(NavigationEnd, NavigationCancel, NavigationError)
  );
  /**
   * All router sequences.
   */
  #routerSequence$: Observable<RouterSequence> = this.#routerEvent$.pipe(
    filterRouterEvents(NavigationStart),
    switchMap((navigationStart) =>
      this.#navigationResult$.pipe(
        filter(
          (navigationResult) => navigationResult.id === navigationStart.id
        ),
        take(1),
        map((navigationResult) => [navigationStart, navigationResult] as const)
      )
    )
  );
  /**
   * All router navigated sequences, that is `NavigationStart` followed by `NavigationEnd`.
   */
  #routerNavigated$: Observable<RouterNavigatedSequence> =
    this.#routerSequence$.pipe(filter(isRouterNavigatedSequence));

  /**
   * The most recent completed navigation.
   */
  #latestRouterNavigatedSequence$: Observable<RouterNavigatedSequence> =
    this.select(
      this.#maxNavigatedId$,
      this.#history$,
      (maxNavigatedId, history) => history[maxNavigatedId]
    );

  /**
   * The current URL.
   */
  currentUrl$: Observable<string> = this.select(
    this.#latestRouterNavigatedSequence$,
    ([, navigationEnd]) => navigationEnd.urlAfterRedirects
  );
  /**
   * The next URL when taking `popstate` events into account.
   *
   * `undefined` is emitted when the current navigation is the last in the
   * navigation history.
   */
  nextUrl$: Observable<string | undefined> = this.select(
    this.#history$,
    this.#maxNavigatedId$,
    (history, maxNavigatedId) => {
      if (maxNavigatedId === 1) {
        return undefined;
      }

      const [sourceNavigationStart] = this.#findSourceNavigatedSequence(
        maxNavigatedId,
        history
      );

      if (sourceNavigationStart.id === maxNavigatedId) {
        return undefined;
      }

      const nextNavigationId = sourceNavigationStart.id + 1;
      const [, nextNavigationEnd] = this.#findSourceNavigatedSequence(
        nextNavigationId,
        history
      );

      return nextNavigationEnd.urlAfterRedirects;
    }
  );
  /**
   * The previous URL when taking `popstate` events into account.
   *
   * `undefined` is emitted when the current navigation is the first in the
   * navigation history.
   */
  previousUrl$: Observable<string | undefined> = this.select(
    this.#history$,
    this.#maxNavigatedId$,
    (history, maxNavigatedId) => {
      if (maxNavigatedId === 1) {
        return undefined;
      }

      const [sourceNavigationStart] = this.#findSourceNavigatedSequence(
        maxNavigatedId,
        history
      );

      if (sourceNavigationStart.id === 1) {
        return undefined;
      }

      const previousNavigationId = sourceNavigationStart.id - 1;
      const [, previousNavigationEnd] = this.#findSourceNavigatedSequence(
        previousNavigationId,
        history
      );

      return previousNavigationEnd.urlAfterRedirects;
    }
  );

  constructor() {
    super(initialState);

    this.#addRouterNavigatedSequence(this.#routerNavigated$);
  }

  /**
   * Navigate back in the browser history.
   *
   * @remarks
   * This is only available when the browser history contains a back entry.
   */
  onNavigateBack = this.effect<void>(pipe(tap(() => this.#location.back())));

  /**
   * Navigate forward in the browser history.
   *
   * @remarks
   * This is only available when the browser history contains a forward entry.
   */
  onNavigateForward = this.effect<void>(
    pipe(tap(() => this.#location.forward()))
  );

  /**
   * Add a router navigated sequence to the router navigated history.
   */
  #addRouterNavigatedSequence = this.updater<RouterNavigatedSequence>(
    (state, routerNavigated): RouterHistoryState => {
      const [{ id: navigationId }] = routerNavigated;

      return {
        ...state,
        history: {
          ...state.history,
          [navigationId]: routerNavigated,
        },
        maxNavigatedId:
          navigationId > (state.maxNavigatedId ?? 0)
            ? navigationId
            : state.maxNavigatedId,
      };
    }
  );

  /**
   * Search the specified history to find the source of the router navigated
   * sequence.
   *
   * This takes `popstate` navigation events into account.
   *
   * @param navigationId The ID of the navigation to trace.
   * @param history The history to search.
   * @returns The source router navigated sequence.
   */
  #findSourceNavigatedSequence(
    navigationId: number,
    history: RouterHistory
  ): RouterNavigatedSequence {
    let navigation = history[navigationId];

    while (isPopstateNavigationStart(navigation[0])) {
      navigation = history[navigation[0].restoredState.navigationId];
    }

    return navigation;
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
