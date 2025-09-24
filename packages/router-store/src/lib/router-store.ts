import { Signal } from '@angular/core';
import { MinimalActivatedRouteSnapshot } from './@ngrx/router-store/minimal-activated-route-state-snapshot';
import { StrictQueryParams } from './strict-query-params';
import { StrictRouteData } from './strict-route-data';
import { StrictRouteParams } from './strict-route-params';

/**
 * An Angular Router-connecting store using Angular Signals.
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
 * import { RouterStore } from '@ngworker/router-store';
 *
 * (@)Component({
 *   // (...)
 * })
 * export class HeroDetailComponent {
 *   #routerStore = inject(RouterStore);
 *
 *   heroId = this.#routerStore.selectRouteParam('id');
 * }
 */
export abstract class RouterStore {
  /**
   * Select the current route.
   */
  abstract readonly currentRoute: Signal<MinimalActivatedRouteSnapshot>;
  /**
   * Select the current route fragment.
   */
  abstract readonly fragment: Signal<string | null>;
  /**
   * Select the current route query parameters.
   */
  abstract readonly queryParams: Signal<StrictQueryParams>;
  /**
   * Select the current route data.
   */
  abstract readonly routeData: Signal<StrictRouteData>;
  /**
   * Select the current route parameters.
   */
  abstract readonly routeParams: Signal<StrictRouteParams>;
  /**
   * Select the resolved route title.
   */
  abstract readonly title: Signal<string | undefined>;
  /**
   * Select the current URL.
   */
  abstract readonly url: Signal<string>;

  /**
   * Select the specified route data.
   *
   * @param key The route data key.
   *
   * @example <caption>Usage</caption>
   * const limit = computed(() => Number(routerStore.selectRouteDataParam('limit')()));
   */
  abstract selectRouteDataParam(key: string): Signal<unknown>;
  /**
   * Select the specified query parameter.
   *
   * @param param The name of the query parameter.
   *
   * @example <caption>Usage</caption>
   * const order = routerStore.selectQueryParam('order');
   */
  abstract selectQueryParam(
    param: string
  ): Signal<string | readonly string[] | undefined>;
  /**
   * Select the specified route parameter.
   *
   * @param param The name of the route parameter.
   *
   * @example <caption>Usage</caption>
   * const id = routerStore.selectRouteParam('id');
   */
  abstract selectRouteParam(param: string): Signal<string | undefined>;
}