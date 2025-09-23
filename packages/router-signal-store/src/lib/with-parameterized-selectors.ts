import { Signal, computed } from '@angular/core';
import { signalStoreFeature, type, withMethods } from '@ngrx/signals';
import { InternalStrictQueryParams } from './internal-strict-query-params';
import { InternalStrictRouteData } from './internal-strict-route-data';
import { InternalStrictRouteParams } from './internal-strict-route-params';

export function withParameterizedSelectors() {
  return signalStoreFeature(
    {
      signals: type<{
        queryParams: Signal<InternalStrictQueryParams>;
        routeData: Signal<InternalStrictRouteData>;
        routeParams: Signal<InternalStrictRouteParams>;
      }>(),
    },
    withMethods(({ queryParams, routeData, routeParams }) => ({
      selectQueryParam(
        param: string
      ): Signal<string | readonly string[] | undefined> {
        return computed(() => queryParams()[param]);
      },
      selectRouteDataParam(key: string): Signal<unknown> {
        return computed(() => routeData()[key]);
      },
      selectRouteParam(param: string): Signal<string | undefined> {
        return computed(() => routeParams()[param]);
      },
    }))
  );
}
