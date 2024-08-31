/**
 * Convert `any` member types to `unknown` in the specified type.
 *
 * @example <caption>Usage</caption>
 * ```
 * type RouteData = { [key: string | symbol]: any; };
 * type StrictRouteData = Strict<RouteData>;
 * ```
 *
 * `StrictRouteData` is `{ [key: string | symbol]: unknown }`.
 */
export type StrictNoAny<TShape> = {
  // [@typescript-eslint/no-explicit-any] We detect `any` to convert it to `unknown`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [TShapeKey in keyof TShape]: TShape[TShapeKey] extends any
    ? unknown
    : TShape[TShapeKey];
};
