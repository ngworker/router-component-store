// [@typescript-eslint/no-unused-vars] Used in TSDoc.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Params } from '@angular/router';

/**
 * Strict route query {@link Params} with read-only members where the `any` member
 * type is converted to `string | readonly string[] | undefined`.
 */
export interface StrictQueryParams {
  readonly [param: string]: string | readonly string[] | undefined;
}
