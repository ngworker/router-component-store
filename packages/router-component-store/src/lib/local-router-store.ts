import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Data, Params, Router } from '@angular/router';
import { distinctUntilChanged, map, Observable } from 'rxjs';

@Injectable()
export class LocalRouterStore {
  // TODO(@LayZeeDK): verify what is emitted
  currentRoute$: Observable<ActivatedRouteSnapshot> = this.router.events.pipe(
    map(() => this.route.snapshot),
    distinctUntilChanged()
  );
  fragment$: Observable<string | null> = this.route.fragment;
  queryParams$: Observable<Params> = this.route.queryParams;
  routeData$: Observable<Data> = this.route.data;
  routeParams$: Observable<Params> = this.route.params;
  // TODO(@LayZeeDK): verify what is emitted
  url$: Observable<string> = this.route.url.pipe(
    map((urlSegments) =>
      this.router.serializeUrl(this.router.createUrlTree(urlSegments))
    )
  );

  constructor(private route: ActivatedRoute, private router: Router) {}

  selectQueryParam<TValue>(param: string): Observable<TValue> {
    return this.queryParams$.pipe(map((params) => params[param]));
  }

  selectRouteParam<TValue>(param: string): Observable<TValue> {
    return this.routeParams$.pipe(map((params) => params[param]));
  }
}
