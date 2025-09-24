import { ClassProvider, Provider } from '@angular/core';
import { MinimalRouterStateSerializer } from '../@ngrx/router-store/minimal_serializer';
import { RouterStore } from '../router-store';
import { GlobalRouterStore } from './global-router-store';

/**
 * Provide an application-wide router store that can be injected in any class.
 *
 * Use this provider factory in a root environment injector.
 *
 * @returns The providers required for a global router store.
 *
 * @example
 * // Providing in a standalone Angular application
 * // main.ts
 * // (...)
 * import { provideGlobalRouterStore } from '@ngworker/router-store';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [provideGlobalRouterStore()],
 * }).catch((error) => console.error(error));
 *
 *
 * @example
 * // Providing in a classic Angular application
 * // app.module.ts
 * // (...)
 * import { provideGlobalRouterStore } from '@ngworker/router-store';
 *
 * (@)NgModule({
 *   // (...)
 *   providers: [provideGlobalRouterStore()],
 * })
 * export class AppModule {}
 */
export function provideGlobalRouterStore(): Provider[] {
  const globalRouterStoreProvider: ClassProvider = {
    provide: RouterStore,
    useClass: GlobalRouterStore,
  };

  return [MinimalRouterStateSerializer, globalRouterStoreProvider];
}