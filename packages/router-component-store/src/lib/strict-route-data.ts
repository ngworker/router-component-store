import { Data } from '@angular/router';
import { OmitSymbolIndex } from './util-types/omit-symbol-index';
import { StrictNoAny } from './util-types/strict-no-any';

/**
 * Serializable route `Data` without its symbol index, in particular without the
 * `Symbol(RouteTitle)` key as this is an internal value for the Angular
 * `Router`.
 *
 * Additionally, the `any` member type is converted to `unknown`.
 */
export type StrictRouteData = Readonly<StrictNoAny<OmitSymbolIndex<Data>>>;
