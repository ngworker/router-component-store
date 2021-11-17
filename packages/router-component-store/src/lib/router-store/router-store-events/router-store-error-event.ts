import { NavigationError } from '@angular/router';
import {
  BaseRouterStoreState,
  SerializedRouterStateSnapshot,
} from '@ngrx/router-store';

/**
 * Payload of `routerStoreErrorType`.
 */
export type RouterStoreErrorPayload<
  TRouterState extends BaseRouterStoreState = SerializedRouterStateSnapshot
> = {
  readonly event: NavigationError;
  readonly routerState: TRouterState;
};

/**
 * An event emitted when the router errors.
 */
export type RouterStoreErrorEvent<
  TRouterState extends BaseRouterStoreState = SerializedRouterStateSnapshot
> = {
  readonly payload: RouterStoreErrorPayload<TRouterState>;
  readonly type: typeof routerStoreErrorType;
};

/**
 * An event emitted when the router errors.
 */
export const routerStoreErrorType = '@ngworker/router-component-store/error';
