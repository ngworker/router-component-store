import { InjectionToken } from '@angular/core';
import { RouterStateSnapshot } from '@angular/router';

/**
 * Generic interface for router state serializers.
 * 
 * @template T The type of the serialized router state.
 */
export interface RouterStateSerializer<T = unknown> {
  /**
   * Serialize the router state snapshot to the desired type.
   * 
   * @param routerState The router state snapshot to serialize.
   * @returns The serialized router state.
   */
  serialize(routerState: RouterStateSnapshot): T;
}

/**
 * Injection token for providing a custom router state serializer.
 * 
 * @example
 * // Providing a custom serializer
 * providers: [
 *   {
 *     provide: ROUTER_STATE_SERIALIZER,
 *     useClass: MyCustomRouterStateSerializer,
 *   }
 * ]
 */
export const ROUTER_STATE_SERIALIZER = new InjectionToken<RouterStateSerializer>(
  'Router State Serializer'
);