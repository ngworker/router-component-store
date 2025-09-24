import { Params } from '@angular/router';
import { StrictNoAny } from './util-types/strict-no-any';

/**
 * @remarks We use this type to ensure compatibility with {@link Params}.
 * @internal
 */
export type InternalStrictRouteParams = Readonly<
  StrictNoAny<Params, string | undefined>
>;
