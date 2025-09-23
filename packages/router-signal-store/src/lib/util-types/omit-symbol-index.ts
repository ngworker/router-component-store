/**
 * Remove `symbol` index signature from the specified type.
 *
 * @example <caption>Usage</caption>
 * ```
 * type RouteData = { [key: string | symbol]: any; };
 * type SerializableRouteData = OmitSymbolIndex<RouteData>;
 * ```
 *
 * `SerializableRouteData` is `{ [key: string]: any }`.
 */
export type OmitSymbolIndex<TShape> = {
  [TShapeKey in keyof TShape as symbol extends TShapeKey
    ? never
    : TShapeKey]: TShape[TShapeKey];
};
