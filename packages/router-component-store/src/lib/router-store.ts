import { Injectable } from '@angular/core';
import { Data, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { MinimalActivatedRouteSnapshot } from './@ngrx/router-store/minimal_serializer';

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
 *   heroId$: Observable<string> = this.routerStore.selectRouteParam('id');
 *
 *   constructor(private routerStore: RouterStore) {}
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
   * Select the current URL.
   */
  abstract readonly url$: Observable<string>;
  /**
   * Select the specified query parameter.
   *
   * @param param The name of the query parameter.
   *
   * @example <caption>Usage</caption>
   * const order$ = routerStore.selectQueryParam('order');
   */
  abstract selectQueryParam<TValue>(param: string): Observable<TValue>;
  /**
   * Select the specified route parameter.
   *
   * @param param The name of the route parameter.
   *
   * @example <caption>Usage</caption>
   * const id$ = routerStore.selectRouteParam('id');
   */
  abstract selectRouteParam<TValue>(param: string): Observable<TValue>;
}
