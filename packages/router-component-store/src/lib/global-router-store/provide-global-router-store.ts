import { ClassProvider, Provider } from '@angular/core';
import { MinimalRouterStateSerializer } from '../@ngrx/router-store/minimal_serializer';
import { ROUTER_STATE_SERIALIZER } from '../router-state-serializer';
import { RouterStore } from '../router-store';
import { RouterStoreConfig } from '../router-store-config';
import { GlobalRouterStore } from './global-router-store';

/**
 * Provide an application-wide router store that can be injected in any class.
 *
 * Use this provider factory in a root environment injector.
 *
 * @param config Optional configuration for the router store.
 * @returns The providers required for a global router store.
 *
 * @example
 * // Providing in a standalone Angular application
 * // main.ts
 * // (...)
 * import { provideGlobalRouterStore } from '@ngworker/router-component-store';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [provideGlobalRouterStore()],
 * }).catch((error) => console.error(error));
 *
 *
 * @example
 * // Providing with a custom serializer
 * // main.ts
 * // (...)
 * import { provideGlobalRouterStore } from '@ngworker/router-component-store';
 * import { MyCustomSerializer } from './my-custom-serializer';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [provideGlobalRouterStore({ serializer: MyCustomSerializer })],
 * }).catch((error) => console.error(error));
 *
 *
 * @example
 * // Providing in a classic Angular application
 * // app.module.ts
 * // (...)
 * import { provideGlobalRouterStore } from '@ngworker/router-component-store';
 *
 * (@)NgModule({
 *   // (...)
 *   providers: [provideGlobalRouterStore()],
 * })
 * export class AppModule {}
 */
export function provideGlobalRouterStore<T = unknown>(config?: RouterStoreConfig<T>): Provider[] {
  const globalRouterStoreProvider: ClassProvider = {
    provide: RouterStore,
    useClass: GlobalRouterStore,
  };

  const serializerProvider: ClassProvider = {
    provide: ROUTER_STATE_SERIALIZER,
    useClass: config?.serializer ?? MinimalRouterStateSerializer,
  };

  return [globalRouterStoreProvider, serializerProvider];
}
