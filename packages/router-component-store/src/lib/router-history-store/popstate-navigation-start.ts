import { NavigationStart } from '@angular/router';
import { NonNullish } from '../util-types/non-nullish';
import { Override } from '../util-types/override';

/**
 * A `NavigationStart` event triggered by a `popstate` event.
 */
export type PopstateNavigationStart = Override<
  NavigationStart,
  {
    navigationTrigger: 'popstate';
  }
> &
  NonNullish<Pick<NavigationStart, 'restoredState'>>;

export function isPopstateNavigationStart(
  event: NavigationStart
): event is PopstateNavigationStart {
  return event.navigationTrigger === 'popstate';
}
