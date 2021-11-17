import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { filter, firstValueFrom, map, Observable, withLatestFrom } from 'rxjs';

import { RouterStore } from './router-store';
import { RouterStoreModule } from './router-store.module';

@Component({
  template: '<router-outlet></router-outlet>',
})
class DummyAppComponent {}

@Component({
  template: '',
})
class DummyLoginComponent {}

describe(`${RouterStore.name} selectors`, () => {
  const afterNavigated = <TValue>(
    observable$: Observable<TValue>
  ): Promise<TValue> =>
    firstValueFrom(
      store.routerStoreEvent$.pipe(
        withLatestFrom(observable$),
        filter(
          ([event]) =>
            event.type === '@ngworker/router-component-store/navigated'
        ),
        map(([_, value]) => value)
      )
    );

  beforeEach(async () => {
    const routes: Routes = [
      {
        path: 'login',
        children: [
          {
            path: ':id',
            component: DummyLoginComponent,
            data: { testData: 'test-data' },
          },
        ],
      },
    ];

    TestBed.configureTestingModule({
      declarations: [DummyAppComponent, DummyLoginComponent],
      imports: [
        RouterTestingModule.withRoutes(routes),
        RouterStoreModule.forRoot(),
      ],
    });

    const rootFixture = TestBed.createComponent(DummyAppComponent);
    rootFixture.autoDetectChanges(true);

    router = TestBed.inject(Router);
    store = TestBed.inject(RouterStore);
  });

  let router: Router;
  let store: RouterStore;

  it('exposes a selector for the current route', async () => {
    const whenCurrentRoute = afterNavigated(store.currentRoute$);

    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(whenCurrentRoute).resolves.toEqual({
      params: {
        id: 'etyDDwAAQBAJ',
      },
      data: {
        testData: 'test-data',
      },
      url: [
        {
          path: 'etyDDwAAQBAJ',
          parameters: {},
        },
      ],
      outlet: 'primary',
      routeConfig: {
        path: ':id',
      },
      queryParams: {
        ref: 'ngrx.io',
      },
      fragment: 'test-fragment',
      children: [],
    });
  });

  it('exposes a selector for the fragment', async () => {
    const whenFragment = afterNavigated(store.fragment$);

    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(whenFragment).resolves.toBe('test-fragment');
  });

  it('exposes a selector for query params', async () => {
    const whenQueryParams = afterNavigated(store.queryParams$);

    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(whenQueryParams).resolves.toEqual({ ref: 'ngrx.io' });
  });

  it('creates a selector for a specific query param', async () => {
    const whenRef = afterNavigated(store.selectQueryParam('ref'));

    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(whenRef).resolves.toBe('ngrx.io');
  });

  it('exposes a selector for route params', async () => {
    const whenRouteParams = afterNavigated(store.routeParams$);

    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(whenRouteParams).resolves.toEqual({ id: 'etyDDwAAQBAJ' });
  });

  it('creates a selector for a specific route param', async () => {
    const whenId = afterNavigated(store.selectRouteParam('id'));

    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(whenId).resolves.toBe('etyDDwAAQBAJ');
  });

  it('exposes a selector for route data', async () => {
    const whenRouteData = afterNavigated(store.routeData$);

    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(whenRouteData).resolves.toEqual({ testData: 'test-data' });
  });

  it('exposes a selector for the URL', async () => {
    const whenUrl = afterNavigated(store.url$);

    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(whenUrl).resolves.toBe(
      '/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment'
    );
  });
});
