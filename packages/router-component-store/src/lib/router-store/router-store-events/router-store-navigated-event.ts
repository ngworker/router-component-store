import { NavigationEnd } from '@angular/router';
import {
  BaseRouterStoreState,
  SerializedRouterStateSnapshot,
} from '@ngrx/router-store';

/**
 * Payload of `routerStoreNavigatedType`.
 */
export type RouterStoreNavigatedPayload<
  TRouterState extends BaseRouterStoreState = SerializedRouterStateSnapshot
> = {
  readonly event: NavigationEnd;
  readonly routerState: TRouterState;
};

/**
 * An event emitted after navigation has ended and new route is active.
 */
export type RouterStoreNavigatedEvent<
  TRouterState extends BaseRouterStoreState = SerializedRouterStateSnapshot
> = {
  readonly payload: RouterStoreNavigatedPayload<TRouterState>;
  readonly type: typeof routerStoreNavigatedType;
};

/**
 * An event emitted after navigation has ended and new route is active.
 */
export const routerStoreNavigatedType =
  '@ngworker/router-component-store/navigated';
