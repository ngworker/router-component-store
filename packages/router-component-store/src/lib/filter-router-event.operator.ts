import { Type } from '@angular/core';
import { Event as RouterEvent } from '@angular/router';
import { filter, OperatorFunction } from 'rxjs';

/**
 * Narrow a stream of router events to the specified router event types.
 *
 * @param acceptedEventTypes The types of router events to accept.
 *
 * @example <caption>Usage</caption>
 * const navigation$ = router.events.pipe(
 *  filterRouterEvents(NavigationStart, NavigationEnd),
 * );
 */
export function filterRouterEvents<
  TAcceptedRouterEvents extends Type<RouterEvent>[]
>(
  ...acceptedEventTypes: [...TAcceptedRouterEvents]
): OperatorFunction<RouterEvent, InstanceType<TAcceptedRouterEvents[number]>> {
  return filter((event: RouterEvent) =>
    acceptedEventTypes.some((eventType) => event instanceof eventType)
  ) as OperatorFunction<
    RouterEvent,
    InstanceType<TAcceptedRouterEvents[number]>
  >;
}
