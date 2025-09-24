/**
 * Serializable route `Data` without its symbol index, in particular without the
 * `Symbol(RouteTitle)` key as this is an internal value for the Angular
 * `Router`.
 *
 * Additionally, the `any` member type is converted to `unknown`.
 */
export interface StrictRouteData {
  readonly [key: string]: unknown;
}
