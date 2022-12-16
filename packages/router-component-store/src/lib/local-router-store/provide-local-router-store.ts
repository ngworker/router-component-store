import { ClassProvider, Provider } from '@angular/core';
import { RouterStore } from '../router-store';
import { LocalRouterStore } from './local-router-store';

/**
 * Provide a component-level router store that can be injected in any directive,
 * component, pipe, or component-level service.
 *
 * Use this provider factory in `Component.providers` or
 * `Component.viewProviders` to make a local router store available to a
 * component sub-tree.
 *
 * @returns The providers required for a local router store.
 *
 * @example
 * // Providing and injecting in a component
 * // hero-detail.component.ts
 * // (...)
 * import {
 *   provideLocalRouterStore,
 *   RouterStore,
 * } from '@ngworker/router-component-store';
 *
 * (@)Component({
 *   // (...)
 *   providers: [provideLocalRouterStore()],
 * })
 * export class HeroDetailComponent {
 *   #routerStore = inject(RouterStore);
 *
 *   heroId$: Observable<string | undefined> = this.#routerStore.selectQueryParam('id');
 * }
 */
export function provideLocalRouterStore(): Provider {
  const localRouterStoreProvider: ClassProvider = {
    provide: RouterStore,
    useClass: LocalRouterStore,
  };

  return localRouterStoreProvider;
}
