import { Data } from '@angular/router';
import { OmitSymbolIndex } from './util-types/omit-symbol-index';
import { StrictNoAny } from './util-types/strict-no-any';

/**
 * @remarks We use this type to ensure compatibility with {@link Data}.
 * @internal
 */
export type InternalStrictRouteData = Readonly<
  StrictNoAny<OmitSymbolIndex<Data>>
>;
