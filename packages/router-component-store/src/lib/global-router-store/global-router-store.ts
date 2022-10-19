import { Injectable } from '@angular/core';
import { Data, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { MinimalActivatedRouteSnapshot } from '../@ngrx/router-store/minimal_serializer';
import { RouterComponentStore } from '../router-component-store';
import { GlobalRouterComponentStore } from './global-router-component-store';

@Injectable()
export class GlobalRouterStore implements RouterComponentStore {
  #store: GlobalRouterComponentStore;

  get currentRoute$(): Observable<MinimalActivatedRouteSnapshot> {
    return this.#store.currentRoute$;
  }
  get fragment$(): Observable<string | null> {
    return this.#store.fragment$;
  }
  get queryParams$(): Observable<Params> {
    return this.#store.queryParams$;
  }
  get routeData$(): Observable<Data> {
    return this.#store.routeData$;
  }
  get routeParams$(): Observable<Params> {
    return this.#store.routeParams$;
  }
  get url$(): Observable<string> {
    return this.#store.url$;
  }

  constructor(store: GlobalRouterComponentStore) {
    this.#store = store;
  }

  selectQueryParam<TValue>(param: string): Observable<TValue> {
    return this.#store.selectQueryParam(param);
  }
  selectRouteParam<TValue>(param: string): Observable<TValue> {
    return this.#store.selectRouteParam(param);
  }
}
