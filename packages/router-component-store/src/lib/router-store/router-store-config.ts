import { InjectionToken, Type } from '@angular/core';
import {
  NavigationActionTiming,
  RouterState,
  RouterStateSerializer,
} from '@ngrx/router-store';

export interface RouterStoreConfig {
  readonly serializer?: Type<RouterStateSerializer>;
  /**
   * By default, ROUTER_NAVIGATION is dispatched before guards and resolvers run.
   * Therefore, the action could run too soon, for example
   * there may be a navigation cancel due to a guard saying the navigation is not allowed.
   * To run ROUTER_NAVIGATION after guards and resolvers,
   * set this property to NavigationActionTiming.PostActivation.
   */
  readonly navigationActionTiming?: NavigationActionTiming;
  /**
   * Decides which router serializer should be used, if there is none provided, and the metadata on the dispatched @ngrx/router-store action payload.
   * Set to `Full` to use the `DefaultRouterStateSerializer` and to set the angular router events as payload.
   * Set to `Minimal` to use the `MinimalRouterStateSerializer` and to set a minimal router event with the navigation id and url as payload.
   */
  readonly routerState?: RouterState;
}

export const routerStoreConfigToken = new InjectionToken<RouterStoreConfig>(
  'routerStoreConfigToken'
);
