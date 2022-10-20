import { ClassProvider, Provider } from '@angular/core';
import { RouterStore } from '../router-store';
import { GlobalRouterStore } from './global-router-store';

export function provideGlobalRouterStore(): Provider {
  const globalRouterStoreProvider: ClassProvider = {
    provide: RouterStore,
    useClass: GlobalRouterStore,
  };

  return globalRouterStoreProvider;
}
