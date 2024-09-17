import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
} from '@angular/router';

export type RouterNavigatedSequence = readonly [NavigationStart, NavigationEnd];
export type RouterSequence = readonly [
  NavigationStart,
  NavigationEnd | NavigationCancel | NavigationError
];

export function isRouterNavigatedSequence(
  sequence: RouterSequence
): sequence is RouterNavigatedSequence {
  return sequence[1] instanceof NavigationEnd;
}
