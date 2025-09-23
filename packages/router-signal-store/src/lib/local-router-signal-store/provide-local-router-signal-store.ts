import { ClassProvider, Provider } from '@angular/core';
import { RouterSignalStore } from '../router-signal-store';
import { LocalRouterSignalStore } from './local-router-signal-store';

/**
 * Provide a component-level router signal store that can be injected in any directive,
 * component, pipe, or component-level service.
 *
 * Use this provider factory in `Component.providers` or
 * `Component.viewProviders` to make a local router signal store available to a
 * component sub-tree.
 *
 * @returns The providers required for a local router signal store.
 *
 * @example
 * // Providing and injecting in a component
 * // hero-detail.component.ts
 * // (...)
 * import {
 *   provideLocalRouterSignalStore,
 *   RouterSignalStore,
 * } from '@ngworker/router-signal-store';
 *
 * (@)Component({
 *   // (...)
 *   providers: [provideLocalRouterSignalStore()],
 * })
 * export class HeroDetailComponent {
 *   #routerStore = inject(RouterSignalStore);
 *
 *   heroId = computed(() => this.#routerStore.selectRouteParam('id')());
 * }
 */
export function provideLocalRouterSignalStore(): Provider[] {
  const localRouterSignalStoreProvider: ClassProvider = {
    provide: RouterSignalStore,
    useClass: LocalRouterSignalStore,
  };

  return [localRouterSignalStoreProvider];
}
