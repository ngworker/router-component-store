import { Data } from '@angular/router';
import { OmitSymbolIndex } from './util-types/omit-symbol-index';

/**
 * Serializable route `Data` without its symbol index, in particular without the
 * `Symbol(RouteTitle)` key as this is an internal value for the Angular
 * `Router`.
 */
export type MinimalRouteData = OmitSymbolIndex<Data>;
