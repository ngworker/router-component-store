import { ClassProvider, Provider } from '@angular/core';
import { RouterComponentStore } from '../router-component-store';
import { LocalRouterComponentStore } from './local-router-component-store';
import { LocalRouterStore } from './local-router-store';

export function provideLocalRouterStore(): Provider {
  const localRouterStoreProvider: ClassProvider = {
    provide: RouterComponentStore,
    useClass: LocalRouterStore,
  };

  return [localRouterStoreProvider, LocalRouterComponentStore];
}
