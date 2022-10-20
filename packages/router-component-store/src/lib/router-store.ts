import { Injectable } from '@angular/core';
import { Data, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { MinimalActivatedRouteSnapshot } from './@ngrx/router-store/minimal_serializer';

@Injectable()
export abstract class RouterStore {
  abstract readonly currentRoute$: Observable<MinimalActivatedRouteSnapshot>;
  abstract readonly fragment$: Observable<string | null>;
  abstract readonly queryParams$: Observable<Params>;
  abstract readonly routeData$: Observable<Data>;
  abstract readonly routeParams$: Observable<Params>;
  abstract readonly url$: Observable<string>;
  abstract selectQueryParam<TValue>(param: string): Observable<TValue>;
  abstract selectRouteParam<TValue>(param: string): Observable<TValue>;
}
