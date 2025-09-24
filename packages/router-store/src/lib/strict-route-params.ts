/**
 * Strict route {@link Params} with read-only members where the `any` member
 * type is converted to `string | undefined`.
 */
export interface StrictRouteParams {
  readonly [param: string]: string | undefined;
}
