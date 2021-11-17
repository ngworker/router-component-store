/**
 * Extract the optional types of the properties whose keys are in the union TMemberKey
 */
export type Optional<TInterface, TMemberKey extends keyof TInterface> = Omit<
  TInterface,
  TMemberKey
> &
  Pick<Partial<TInterface>, TMemberKey>;
