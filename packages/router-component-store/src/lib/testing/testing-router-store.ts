import { inject, Injectable, Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Event as RouterEvent } from '@angular/router';
import { BehaviorSubject, NEVER, Observable } from 'rxjs';
import { MinimalActivatedRouteSnapshot } from '../@ngrx/router-store/minimal-activated-route-state-snapshot';
import { RouterStore } from '../router-store';
import { StrictQueryParams } from '../strict-query-params';
import { StrictRouteData } from '../strict-route-data';
import { StrictRouteParams } from '../strict-route-params';

/**
 * A testing implementation of `RouterStore` that provides stubbed observables
 * for easy test setup and improved developer experience.
 *
 * Use `provideTestingRouterStore()` to provide this service in your tests.
 *
 * @example
 * ```typescript
 * // In your test setup
 * TestBed.configureTestingModule({
 *   providers: [provideTestingRouterStore()],
 * });
 * 
 * // Option 1: Manual casting
 * const routerStore = TestBed.inject(RouterStore) as TestingRouterStore;
 * routerStore.setUrl('/test/123');
 * routerStore.setRouteParam('id', '123');
 * 
 * // Option 2: Using injection helper (recommended)
 * const routerStore = injectTestingRouterStore();
 * routerStore.setUrl('/test/123');
 * routerStore.setRouteParam('id', '123');
 * ```
 */
@Injectable()
export class TestingRouterStore implements RouterStore {
  private readonly _currentRoute$ = new BehaviorSubject<MinimalActivatedRouteSnapshot>(
    this.createDefaultRoute()
  );
  private readonly _fragment$ = new BehaviorSubject<string | null>(null);
  private readonly _queryParams$ = new BehaviorSubject<StrictQueryParams>({});
  private readonly _routeData$ = new BehaviorSubject<StrictRouteData>({});
  private readonly _routeParams$ = new BehaviorSubject<StrictRouteParams>({});
  private readonly _title$ = new BehaviorSubject<string | undefined>(undefined);
  private readonly _url$ = new BehaviorSubject<string>('/');

  readonly currentRoute$: Observable<MinimalActivatedRouteSnapshot> = this._currentRoute$.asObservable();
  readonly fragment$: Observable<string | null> = this._fragment$.asObservable();
  readonly queryParams$: Observable<StrictQueryParams> = this._queryParams$.asObservable();
  readonly routeData$: Observable<StrictRouteData> = this._routeData$.asObservable();
  readonly routeParams$: Observable<StrictRouteParams> = this._routeParams$.asObservable();
  readonly title$: Observable<string | undefined> = this._title$.asObservable();
  readonly url$: Observable<string> = this._url$.asObservable();

  selectRouteData(key: string): Observable<unknown> {
    return this.selectRouteDataParam(key);
  }

  selectRouteDataParam(key: string): Observable<unknown> {
    return new Observable(subscriber => {
      const subscription = this._routeData$.subscribe(data => {
        subscriber.next(data[key]);
      });
      return () => subscription.unsubscribe();
    });
  }

  selectQueryParam(param: string): Observable<string | readonly string[] | undefined> {
    return new Observable(subscriber => {
      const subscription = this._queryParams$.subscribe(params => {
        subscriber.next(params[param]);
      });
      return () => subscription.unsubscribe();
    });
  }

  selectRouteParam(param: string): Observable<string | undefined> {
    return new Observable(subscriber => {
      const subscription = this._routeParams$.subscribe(params => {
        subscriber.next(params[param]);
      });
      return () => subscription.unsubscribe();
    });
  }

  selectRouterEvents<TAcceptedRouterEvents extends Type<RouterEvent>[]>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...acceptedEventTypes: [...TAcceptedRouterEvents]
  ): Observable<InstanceType<TAcceptedRouterEvents[number]>> {
    // Router events are not typically stubbed in unit tests
    // Return NEVER observable to avoid unexpected emissions during tests
    return NEVER;
  }

  // Testing utility methods

  /**
   * Set the current route snapshot.
   * 
   * @param route The route snapshot to set
   */
  setCurrentRoute(route: MinimalActivatedRouteSnapshot): void {
    this._currentRoute$.next(route);
  }

  /**
   * Set the current URL fragment.
   * 
   * @param fragment The fragment to set
   */
  setFragment(fragment: string | null): void {
    this._fragment$.next(fragment);
  }

  /**
   * Set the current query parameters.
   * 
   * @param queryParams The query parameters to set
   */
  setQueryParams(queryParams: StrictQueryParams): void {
    this._queryParams$.next(queryParams);
  }

  /**
   * Set a specific query parameter.
   * 
   * @param param The parameter name
   * @param value The parameter value
   */
  setQueryParam(param: string, value: string | readonly string[] | undefined): void {
    const currentParams = this._queryParams$.value;
    this._queryParams$.next({ ...currentParams, [param]: value });
  }

  /**
   * Set the current route data.
   * 
   * @param routeData The route data to set
   */
  setRouteData(routeData: StrictRouteData): void {
    this._routeData$.next(routeData);
  }

  /**
   * Set a specific route data parameter.
   * 
   * @param key The data key
   * @param value The data value
   */
  setRouteDataParam(key: string, value: unknown): void {
    const currentData = this._routeData$.value;
    this._routeData$.next({ ...currentData, [key]: value });
  }

  /**
   * Set the current route parameters.
   * 
   * @param routeParams The route parameters to set
   */
  setRouteParams(routeParams: StrictRouteParams): void {
    this._routeParams$.next(routeParams);
  }

  /**
   * Set a specific route parameter.
   * 
   * @param param The parameter name
   * @param value The parameter value
   */
  setRouteParam(param: string, value: string | undefined): void {
    const currentParams = this._routeParams$.value;
    this._routeParams$.next({ ...currentParams, [param]: value });
  }

  /**
   * Set the resolved route title.
   * 
   * @param title The title to set
   */
  setTitle(title: string | undefined): void {
    this._title$.next(title);
  }

  /**
   * Set the current URL.
   * 
   * @param url The URL to set
   */
  setUrl(url: string): void {
    this._url$.next(url);
  }

  /**
   * Reset all values to their defaults.
   */
  reset(): void {
    this._currentRoute$.next(this.createDefaultRoute());
    this._fragment$.next(null);
    this._queryParams$.next({});
    this._routeData$.next({});
    this._routeParams$.next({});
    this._title$.next(undefined);
    this._url$.next('/');
  }

  private createDefaultRoute(): MinimalActivatedRouteSnapshot {
    return {
      routeConfig: null,
      url: [],
      params: {},
      queryParams: {},
      fragment: null,
      data: {},
      outlet: 'primary',
      title: undefined,
      firstChild: undefined,
      children: [],
    };
  }
}

/**
 * Options for the `injectTestingRouterStore` function.
 */
export interface InjectTestingRouterStoreOptions {
  /**
   * Use optional injection, and return `null` if the requested token is not found.
   */
  optional?: boolean;
  /**
   * Start injection at the parent of the current injector.
   */
  skipSelf?: boolean;
  /**
   * Only query the current injector for the token, and don't fall back to the parent injector if
   * it's not found.
   */
  self?: boolean;
  /**
   * Stop injection at the host component's injector. Only relevant when injecting from an element
   * injector, and a no-op for environment injectors.
   */
  host?: boolean;
}

/**
 * Configuration for injecting from a specific component's injector.
 */
export interface InjectFromComponentOptions<TComponent = unknown> {
  /**
   * The component type to get the injector from.
   */
  component: Type<TComponent>;
  /**
   * The component fixture to query for the component instance.
   */
  fixture: ComponentFixture<unknown>;
  /**
   * Additional injection options.
   */
  options?: InjectTestingRouterStoreOptions;
}

/**
 * Inject a `TestingRouterStore` instance without the need for casting.
 * 
 * This is a convenience function that injects the `RouterStore` token and
 * casts it to `TestingRouterStore`, providing direct access to testing methods.
 * 
 * ⚠️ **Important**: This function should only be used when `provideTestingRouterStore()`
 * is provided in the testing module. Using it with the actual router store providers
 * will result in a runtime error.
 * 
 * @param options - Injection options similar to Angular's inject() function
 * @returns A `TestingRouterStore` instance with direct access to testing methods
 * 
 * @example
 * ```typescript
 * // Basic usage
 * TestBed.runInInjectionContext(() => {
 *   const routerStore = injectTestingRouterStore();
 *   routerStore.setRouteParam('id', '123');
 * });
 * 
 * // With injection options
 * TestBed.runInInjectionContext(() => {
 *   const routerStore = injectTestingRouterStore({ optional: true, host: true });
 *   routerStore?.setRouteParam('id', '123');
 * });
 * ```
 */
export function injectTestingRouterStore(): TestingRouterStore;

/**
 * Inject a `TestingRouterStore` instance with injection options.
 * 
 * @param options - Injection options (optional, skipSelf, self, host)
 * @returns A `TestingRouterStore` instance or null if optional and not found
 */
export function injectTestingRouterStore(
  options: InjectTestingRouterStoreOptions & { optional: true }
): TestingRouterStore | null;

/**
 * Inject a `TestingRouterStore` instance with injection options.
 * 
 * @param options - Injection options (skipSelf, self, host)
 * @returns A `TestingRouterStore` instance
 */
export function injectTestingRouterStore(
  options: InjectTestingRouterStoreOptions
): TestingRouterStore;

/**
 * Inject a `TestingRouterStore` instance from a specific component's injector.
 * 
 * This overload is particularly useful for testing local router stores that are
 * provided at the component level.
 * 
 * @param config - Configuration specifying the component and fixture
 * @returns A `TestingRouterStore` instance from the component's injector
 * 
 * @example
 * ```typescript
 * // Inject from a specific component (useful for local router stores)
 * const fixture = TestBed.createComponent(HeroComponent);
 * const routerStore = injectTestingRouterStore({
 *   component: HeroComponent,
 *   fixture,
 *   options: { host: true }
 * });
 * routerStore.setRouteParam('id', '456');
 * ```
 */
export function injectTestingRouterStore<TComponent>(
  config: InjectFromComponentOptions<TComponent>
): TestingRouterStore;

export function injectTestingRouterStore<TComponent>(
  optionsOrConfig?:
    | InjectTestingRouterStoreOptions
    | InjectFromComponentOptions<TComponent>
): TestingRouterStore | null {
  // Check if it's a component injection configuration
  if (optionsOrConfig && 'component' in optionsOrConfig) {
    const { component, fixture, options = {} } = optionsOrConfig;
    const componentDebugElement = fixture.debugElement.query(By.directive(component));
    
    if (!componentDebugElement) {
      throw new Error(
        `Component ${component.name} not found in fixture. ` +
        'Make sure the component is rendered in the fixture.'
      );
    }
    
    const componentInjector = componentDebugElement.injector;
    const routerStore = componentInjector.get(RouterStore, undefined, options);
    return routerStore as TestingRouterStore;
  }
  
  // Use standard injection with options
  const options = optionsOrConfig || {};
  return inject(RouterStore, options) as TestingRouterStore;
}