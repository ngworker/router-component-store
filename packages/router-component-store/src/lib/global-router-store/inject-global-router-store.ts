import { EnvironmentInjector, inject, InjectOptions } from '@angular/core';
import { RouterStore } from '../router-store';

export function injectGlobalRouterStore(
  injectOptions?: InjectOptions
): RouterStore {
  return inject(EnvironmentInjector).get(RouterStore, undefined, injectOptions);
}
