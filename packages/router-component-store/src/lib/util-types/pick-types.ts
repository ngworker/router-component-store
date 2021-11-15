/**
 * Extract the type of one or more public members.
 */
export type PickTypes<
  TInterface,
  TMemberKeys extends keyof TInterface
> = TInterface[TMemberKeys];
