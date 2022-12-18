/**
 * `Object.fromEntries` polyfill.
 */
export function objectFromEntries<TValue>(entries: [string, TValue][]): {
  [key: string]: TValue;
} {
  return entries.reduce(
    (object, [key, value]) => ({ ...object, [key]: value }),
    {}
  );
}
