import { ClassProvider, Provider } from '@angular/core';
import { RouterStore } from '../router-store';
import { LocalRouterStore } from './local-router-store';

export function provideLocalRouterStore(): Provider {
  const localRouterStoreProvider: ClassProvider = {
    provide: RouterStore,
    useClass: LocalRouterStore,
  };

  return localRouterStoreProvider;
}
