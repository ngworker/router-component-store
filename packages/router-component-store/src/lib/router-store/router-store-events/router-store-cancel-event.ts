import { NavigationCancel } from '@angular/router';
import {
  BaseRouterStoreState,
  SerializedRouterStateSnapshot,
} from '@ngrx/router-store';

/**
 * Payload of `routerStoreCancelType`.
 */
export type RouterStoreCancelPayload<
  TRouterState extends BaseRouterStoreState = SerializedRouterStateSnapshot
> = {
  readonly event: NavigationCancel;
  readonly routerState: TRouterState;
};

/**
 * An event emitted when the router cancels navigation.
 */
export type RouterStoreCancelEvent<
  TRouterState extends BaseRouterStoreState = SerializedRouterStateSnapshot
> = {
  readonly payload: RouterStoreCancelPayload<TRouterState>;
  readonly type: typeof routerStoreCancelType;
};

/**
 * An event emitted when the router cancels navigation.
 */
export const routerStoreCancelType = '@ngworker/router-component-store/cancel';
