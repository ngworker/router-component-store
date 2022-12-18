import { Injectable } from '@angular/core';
import { Data, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { MinimalActivatedRouteSnapshot } from './@ngrx/router-store/minimal-activated-route-snapshot';

/**
 * An Angular Router-connecting NgRx component store.
 *
 * A `RouterStore` service is provided by using either
 * `provideGlobalRouterStore` or `provideLocalRouterStore`.
 *
 * The _global_ `RouterStore` service is provided in a root environment injector
 * and is never destroyed but can be injected in any class.
 *
 * A _local_ `RouterStore` requires a component-level provider, follows the
 * lifecycle of that component, and can be injected in declarables as well as
 * other component-level services.
 *
 * @example
 * // Usage in a component
 * // hero-detail.component.ts
 * // (...)
 * import { RouterStore } from '@ngworker/router-component-store';
 *
 * (@)Component({
 *   // (...)
 * })
 * export class HeroDetailComponent {
 *   #routerStore = inject(RouterStore);
 *
 *   heroId$: Observable<string | undefined> = this.#routerStore.selectRouteParam('id');
 * }
 */
@Injectable()
export abstract class RouterStore {
  /**
   * Select the current route.
   */
  abstract readonly currentRoute$: Observable<MinimalActivatedRouteSnapshot>;
  /**
   * Select the current route fragment.
   */
  abstract readonly fragment$: Observable<string | null>;
  /**
   * Select the current route query parameters.
   */
  abstract readonly queryParams$: Observable<Params>;
  /**
   * Select the current route data.
   */
  abstract readonly routeData$: Observable<Data>;
  /**
   * Select the current route parameters.
   */
  abstract readonly routeParams$: Observable<Params>;
  /**
   * Select the resolved route title.
   */
  abstract readonly title$: Observable<string | undefined>;
  /**
   * Select the current URL.
   */
  abstract readonly url$: Observable<string>;
  /**
   * Select the specified route data.
   *
   * @param key The route data key.
   *
   * @example <caption>Usage</caption>
   * const limit$ = routerStore.selectRouteData<number>('limit');
   */
  abstract selectRouteData<TValue>(key: string): Observable<TValue | undefined>;
  /**
   * Select the specified query parameter.
   *
   * @param param The name of the query parameter.
   *
   * @example <caption>Usage</caption>
   * const order$ = routerStore.selectQueryParam('order');
   */
  abstract selectQueryParam(param: string): Observable<string | undefined>;
  /**
   * Select the specified route parameter.
   *
   * @param param The name of the route parameter.
   *
   * @example <caption>Usage</caption>
   * const id$ = routerStore.selectRouteParam('id');
   */
  abstract selectRouteParam(param: string): Observable<string | undefined>;
}
