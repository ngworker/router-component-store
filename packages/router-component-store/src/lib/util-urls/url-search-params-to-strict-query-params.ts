import { Params } from '@angular/router';
import { StrictQueryParams } from '../strict-query-params';

export function urlSearchParamsToStrictQueryParams(
  searchParams: URLSearchParams
): StrictQueryParams {
  const result = Array.from(searchParams.entries()).reduce(
    (x, [key, value]) => {
      if (key in x) {
        x[key] = Array.isArray(x[key]) ? [...x[key], value] : [x[key], value];
      } else {
        x[key] = value;
      }

      return x;
    },
    {} as Params
  );

  return {
    ...result,
  };
}
