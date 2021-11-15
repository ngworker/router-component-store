import { RoutesRecognized } from '@angular/router';
import {
  BaseRouterStoreState,
  SerializedRouterStateSnapshot,
} from '@ngrx/router-store';

/**
 * Payload of `routerStoreNavigationType`.
 */
export type RouterStoreNavigationPayload<
  TRouterState extends BaseRouterStoreState = SerializedRouterStateSnapshot
> = {
  readonly event: RoutesRecognized;
  readonly routerState: TRouterState;
};

/**
 * An event emitted when the router navigates.
 */
export type RouterStoreNavigationEvent<
  TRouterState extends BaseRouterStoreState = SerializedRouterStateSnapshot
> = {
  readonly payload: RouterStoreNavigationPayload<TRouterState>;
  readonly type: typeof routerStoreNavigationType;
};

/**
 * An event emitted when the router navigates.
 */
export const routerStoreNavigationType =
  '@ngworker/router-component-store/navigation';
