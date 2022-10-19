import { ClassProvider, Injectable, Provider } from '@angular/core';
import { Data, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { MinimalActivatedRouteSnapshot } from '../@ngrx/router-store/minimal_serializer';
import { RouterComponentStore } from '../router-component-store';
import { LocalRouterComponentStore } from './local-router-component-store';

export function provideLocalRouterStore(): Provider {
  const localRouterStoreProvider: ClassProvider = {
    provide: RouterComponentStore,
    useClass: LocalRouterStore,
  };

  return [localRouterStoreProvider, LocalRouterComponentStore];
}

@Injectable()
export class LocalRouterStore implements RouterComponentStore {
  #store: LocalRouterComponentStore;

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

  constructor(store: LocalRouterComponentStore) {
    this.#store = store;
  }

  selectQueryParam<TValue>(param: string): Observable<TValue> {
    return this.#store.selectQueryParam(param);
  }
  selectRouteParam<TValue>(param: string): Observable<TValue> {
    return this.#store.selectRouteParam(param);
  }
}
