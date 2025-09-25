import { Type } from '@angular/core';
import { RouterStateSerializer } from './router-state-serializer';

/**
 * Configuration for router store providers.
 * 
 * @template T The type of the router state produced by the serializer.
 */
export interface RouterStoreConfig<T = unknown> {
  /**
   * The router state serializer to use for serializing router state snapshots.
   * If not provided, the default MinimalRouterStateSerializer will be used.
   */
  serializer?: Type<RouterStateSerializer<T>>;
}