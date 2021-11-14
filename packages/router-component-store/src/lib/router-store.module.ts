import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import {
  DefaultRouterStateSerializer,
  MinimalRouterStateSerializer,
  NavigationActionTiming,
  RouterState,
  RouterStateSerializer,
} from '@ngrx/router-store';

import { RouterStoreConfig, routerStoreConfigToken } from './router-store-config';

function createRouterConfig(config: RouterStoreConfig): RouterStoreConfig {
  return {
    serializer: MinimalRouterStateSerializer,
    navigationActionTiming: NavigationActionTiming.PreActivation,
    ...config,
  };
}

// TODO(@LayZeeDK): guard against direct import
@NgModule()
export class RouterStoreModule {
  static forRoot(
    config: RouterStoreConfig = {}
  ): ModuleWithProviders<RouterStoreModule> {
    return {
      ngModule: RouterStoreModule,
      providers: [
        { provide: internalRouterStoreConfigToken, useValue: config },
        {
          provide: routerStoreConfigToken,
          useFactory: createRouterConfig,
          deps: [internalRouterStoreConfigToken],
        },
        {
          provide: RouterStateSerializer,
          useClass: config.serializer
            ? config.serializer
            : config.routerState === RouterState.Full
            ? DefaultRouterStateSerializer
            : MinimalRouterStateSerializer,
        },
      ],
    };
  }
}

export const internalRouterStoreConfigToken =
  new InjectionToken<RouterStoreConfig>('internalRouterStoreConfigToken');
