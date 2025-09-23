import { ClassProvider, Provider } from '@angular/core';
import { MinimalRouterStateSerializer } from '../@ngrx/router-store/minimal_serializer';
import { RouterSignalStore } from '../router-signal-store';
import { GlobalRouterSignalStore } from './global-router-signal-store';

/**
 * Provide an application-wide router signal store that can be injected in any class.
 *
 * Use this provider factory in a root environment injector.
 *
 * @returns The providers required for a global router signal store.
 *
 * @example
 * // Providing in a standalone Angular application
 * // main.ts
 * // (...)
 * import { provideGlobalRouterSignalStore } from '@ngworker/router-signal-store';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [provideGlobalRouterSignalStore()],
 * }).catch((error) => console.error(error));
 *
 *
 * @example
 * // Providing in a classic Angular application
 * // app.module.ts
 * // (...)
 * import { provideGlobalRouterSignalStore } from '@ngworker/router-signal-store';
 *
 * (@)NgModule({
 *   // (...)
 *   providers: [provideGlobalRouterSignalStore()],
 * })
 * export class AppModule {}
 */
export function provideGlobalRouterSignalStore(): Provider[] {
  const globalRouterSignalStoreProvider: ClassProvider = {
    provide: RouterSignalStore,
    useClass: GlobalRouterSignalStore,
  };

  return [MinimalRouterStateSerializer, globalRouterSignalStoreProvider];
}
