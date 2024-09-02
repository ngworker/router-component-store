import { Params } from '@angular/router';
import { StrictNoAny } from './util-types/strict-no-any';

/**
 * Strict route {@link Params} with read-only members where the `any` member
 * type is converted to `string | undefined`.
 */
export type StrictRouteParams = Readonly<
  StrictNoAny<Params, string | undefined>
>;
