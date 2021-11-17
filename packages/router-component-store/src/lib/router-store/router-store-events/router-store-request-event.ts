import { NavigationStart } from '@angular/router';
import {
  BaseRouterStoreState,
  SerializedRouterStateSnapshot,
} from '@ngrx/router-store';

/**
 * Payload of `routerStoreRequestType`
 */
export type RouterStoreRequestPayload<
  TRouterState extends BaseRouterStoreState = SerializedRouterStateSnapshot
> = {
  readonly event: NavigationStart;
  readonly routerState: TRouterState;
};

/**
 * An event emitted when a router navigation request is fired.
 */
export type RouterStoreRequestEvent<
  TRouterState extends BaseRouterStoreState = SerializedRouterStateSnapshot
> = {
  readonly payload: RouterStoreRequestPayload<TRouterState>;
  readonly type: typeof routerStoreRequestType;
};

/**
 * An event emitted when a router navigation request is fired.
 */
export const routerStoreRequestType =
  '@ngworker/router-component-store/request';
