import {
  BaseRouterStoreState,
  SerializedRouterStateSnapshot,
} from '@ngrx/router-store';

import { PickTypes } from '../util-types/pick-types';
import { RouterStoreCancelEvent } from './router-store-cancel-event';
import { RouterStoreErrorEvent } from './router-store-error-event';
import { RouterStoreNavigatedEvent } from './router-store-navigated-event';
import { RouterStoreNavigationEvent } from './router-store-navigation-event';
import { RouterStoreRequestEvent } from './router-store-request-event';

/**
 * A union type of router store events.
 */
export type RouterStoreEvent<
  TRouterState extends BaseRouterStoreState = SerializedRouterStateSnapshot
> =
  | RouterStoreCancelEvent<TRouterState>
  | RouterStoreErrorEvent<TRouterState>
  | RouterStoreNavigatedEvent<TRouterState>
  | RouterStoreNavigationEvent<TRouterState>
  | RouterStoreRequestEvent<TRouterState>;

export type RouterStoreEventType = PickTypes<RouterStoreEvent, 'type'>;
