import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { firstValueFrom } from 'rxjs';
import { RouterComponentStore } from '../router-component-store';
import {
  GlobalRouterStore,
  provideGlobalRouterStore,
} from './global-router-store';

@Component({
  template: '<router-outlet></router-outlet>',
})
class DummyAppComponent {}

@Component({
  template: '',
})
class DummyLoginComponent {}

describe(`${GlobalRouterStore.name} selectors`, () => {
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
      imports: [RouterTestingModule.withRoutes(routes)],
      providers: [provideGlobalRouterStore()],
    });

    const rootFixture = TestBed.createComponent(DummyAppComponent);
    rootFixture.autoDetectChanges(true);

    router = TestBed.inject(Router);
    store = TestBed.inject(RouterComponentStore);
  });

  let router: Router;
  let store: RouterComponentStore;

  it('exposes a selector for the current route', async () => {
    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(firstValueFrom(store.currentRoute$)).resolves.toEqual({
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
    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(firstValueFrom(store.fragment$)).resolves.toBe(
      'test-fragment'
    );
  });

  it('exposes a selector for query params', async () => {
    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(firstValueFrom(store.queryParams$)).resolves.toEqual({
      ref: 'ngrx.io',
    });
  });

  it('creates a selector for a specific query param', async () => {
    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(firstValueFrom(store.selectQueryParam('ref'))).resolves.toBe(
      'ngrx.io'
    );
  });

  it('exposes a selector for route params', async () => {
    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(firstValueFrom(store.routeParams$)).resolves.toEqual({
      id: 'etyDDwAAQBAJ',
    });
  });

  it('creates a selector for a specific route param', async () => {
    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(firstValueFrom(store.selectRouteParam('id'))).resolves.toBe(
      'etyDDwAAQBAJ'
    );
  });

  it('exposes a selector for route data', async () => {
    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(firstValueFrom(store.routeData$)).resolves.toEqual({
      testData: 'test-data',
    });
  });

  it('exposes a selector for the URL', async () => {
    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(firstValueFrom(store.url$)).resolves.toBe(
      '/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment'
    );
  });
});
