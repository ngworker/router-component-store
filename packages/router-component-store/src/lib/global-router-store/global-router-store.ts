import { Injectable } from '@angular/core';
import { Data, Params } from '@angular/router';
import { Observable } from 'rxjs';

import { MinimalActivatedRouteSnapshot } from '../@ngrx/router-store/minimal_serializer';
import { RouterComponentStore } from '../router-component-store';
import { GlobalRouterComponentStore } from './global-router-component-store';

@Injectable({
  providedIn: 'root',
})
export class GlobalRouterStore implements RouterComponentStore {
  #store: GlobalRouterComponentStore;

  readonly currentRoute$: Observable<MinimalActivatedRouteSnapshot>;
  readonly fragment$: Observable<string | null>;
  readonly queryParams$: Observable<Params>;
  readonly routeData$: Observable<Data>;
  readonly routeParams$: Observable<Params>;
  readonly url$: Observable<string>;

  constructor(store: GlobalRouterComponentStore) {
    this.#store = store;
    this.currentRoute$ = store.currentRoute$;
    this.fragment$ = store.fragment$;
    this.queryParams$ = store.queryParams$;
    this.routeData$ = store.routeData$;
    this.routeParams$ = store.routeParams$;
    this.url$ = store.url$;
  }

  selectQueryParam<TValue>(param: string): Observable<TValue> {
    return this.#store.selectQueryParam(param);
  }
  selectRouteParam<TValue>(param: string): Observable<TValue> {
    return this.#store.selectRouteParam(param);
  }
}
