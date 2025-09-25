import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Event as RouterEvent,
  RoutesRecognized,
} from '@angular/router';

/**
 * @returns `true` when the specified Angular Router event is navigation event
 *   that causes `RouterStore` to synchronize its internal state.
 * @returns `false` otherwise
 */
export function isNavigationEvent(routerEvent: RouterEvent): boolean {
  return [
    NavigationStart,
    RoutesRecognized,
    NavigationEnd,
    NavigationCancel,
    NavigationError,
  ].some((navigationEventType) => routerEvent instanceof navigationEventType);
}
