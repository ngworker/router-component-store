import { ClassProvider, Provider } from '@angular/core';
import { RouterComponentStore } from '../router-component-store';
import { GlobalRouterStore } from './global-router-store';

export function provideGlobalRouterStore(): Provider {
  const globalRouterStoreProvider: ClassProvider = {
    provide: RouterComponentStore,
    useClass: GlobalRouterStore,
  };

  return globalRouterStoreProvider;
}
