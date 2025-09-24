/**
 * Convert `any` member types to `unknown` or a specified type in the specified
 * type.
 *
 * @example <caption>Usage</caption>
 * ```
 * type RouteData = { [key: string | symbol]: any; };
 * type StrictRouteData = Strict<RouteData>;
 * ```
 *
 * `StrictRouteData` is `{ [key: string | symbol]: unknown }`.
 */
export type StrictNoAny<TShape, TStrictType = unknown> = {
  // [@typescript-eslint/no-explicit-any] We detect `any` to convert it to the specified type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [TShapeKey in keyof TShape]: TShape[TShapeKey] extends any
    ? TStrictType
    : TShape[TShapeKey];
};
