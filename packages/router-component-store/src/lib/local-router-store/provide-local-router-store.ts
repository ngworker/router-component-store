import { ClassProvider, Provider } from '@angular/core';
import { MinimalRouterStateSerializer } from '../@ngrx/router-store/minimal_serializer';
import { ROUTER_STATE_SERIALIZER } from '../router-state-serializer';
import { RouterStore } from '../router-store';
import { RouterStoreConfig } from '../router-store-config';
import { LocalRouterStore } from './local-router-store';

/**
 * Provide a component-level router store that can be injected in any directive,
 * component, pipe, or component-level service.
 *
 * Use this provider factory in `Component.providers` or
 * `Component.viewProviders` to make a local router store available to a
 * component sub-tree.
 *
 * @param config Optional configuration for the router store.
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
 *
 * @example
 * // Providing with a custom serializer
 * // hero-detail.component.ts
 * // (...)
 * import {
 *   provideLocalRouterStore,
 *   RouterStore,
 * } from '@ngworker/router-component-store';
 * import { MyCustomSerializer } from './my-custom-serializer';
 *
 * (@)Component({
 *   // (...)
 *   providers: [provideLocalRouterStore({ serializer: MyCustomSerializer })],
 * })
 * export class HeroDetailComponent {
 *   #routerStore = inject(RouterStore);
 *
 *   heroId$: Observable<string | undefined> = this.#routerStore.selectQueryParam('id');
 * }
 */
export function provideLocalRouterStore<T = unknown>(config?: RouterStoreConfig<T>): Provider[] {
  const localRouterStoreProvider: ClassProvider = {
    provide: RouterStore,
    useClass: LocalRouterStore,
  };

  const serializerProvider: ClassProvider = {
    provide: ROUTER_STATE_SERIALIZER,
    useClass: config?.serializer ?? MinimalRouterStateSerializer,
  };

  return [localRouterStoreProvider, serializerProvider];
}
