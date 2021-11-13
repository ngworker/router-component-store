import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Data, Params, Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { SerializedRouterStateSnapshot } from '@ngrx/router-store';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
// No internal state
// eslint-disable-next-line @typescript-eslint/ban-types
export class RouterStore extends ComponentStore<{}> {
  // TODO(LayZeeDK): select router state
  #routerState$: Observable<SerializedRouterStateSnapshot> = of({
    root: {} as any,
    url: '/',
  });
  #rootRoute$: Observable<ActivatedRouteSnapshot> = this.select(
    this.#routerState$,
    (routerState) => routerState?.root
  );

  // TODO(LayZeeDK): determine whether we need to add `undefined` to the type of
  //   the public selectors depending on the final type of `#routerState$`

  currentRoute$: Observable<ActivatedRouteSnapshot | undefined> = this.select(
    this.#rootRoute$,
    (rootRoute) => {
      if (!rootRoute) {
        return undefined;
      }

      let route = rootRoute;

      while (route.firstChild) {
        route = route.firstChild;
      }

      return route;
    }
  );
  fragment$: Observable<string | null> = this.select(
    this.#rootRoute$,
    (route) => route?.fragment
  );
  queryParams$: Observable<Params> = this.select(
    this.#rootRoute$,
    (route) => route?.queryParams
  );
  routeData$: Observable<Data | undefined> = this.select(
    this.currentRoute$,
    (route) => route?.data
  );
  routeParams$: Observable<Params | undefined> = this.select(
    this.currentRoute$,
    (route) => route?.params
  );
  url$: Observable<string> = this.select(
    this.#routerState$,
    (routerState) => routerState?.url
  );

  constructor(private router: Router) {
    super({});
  }

  selectQueryParam<T>(param: string): Observable<T | undefined> {
    return this.select(this.queryParams$, (params) => params?.[param]);
  }

  selectRouteParam<T>(param: string): Observable<T | undefined> {
    return this.select(this.routeParams$, (params) => params?.[param]);
  }
}
