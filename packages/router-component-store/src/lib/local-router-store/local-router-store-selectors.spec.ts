import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { firstValueFrom } from 'rxjs';
import { RouterComponentStore } from '../router-component-store';
import {
  LocalRouterStore,
  provideLocalRouterStore,
} from './local-router-store';

@Component({
  template: '<router-outlet></router-outlet>',
})
class DummyAppComponent {}

@Component({
  template: '',
  viewProviders: [provideLocalRouterStore()],
})
class DummyLoginComponent {
  constructor(public store: RouterComponentStore) {}
}

describe(`${LocalRouterStore.name} selectors`, () => {
  const getStore = () =>
    (
      rootFixture.debugElement.query(By.directive(DummyLoginComponent))
        .componentInstance as DummyLoginComponent
    ).store;

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
    });

    rootFixture = TestBed.createComponent(DummyAppComponent);
    rootFixture.autoDetectChanges(true);

    router = TestBed.inject(Router);
  });

  let router: Router;
  let rootFixture: ComponentFixture<DummyAppComponent>;

  it('exposes a selector for the current route', async () => {
    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(firstValueFrom(getStore().currentRoute$)).resolves.toEqual({
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

    await expect(firstValueFrom(getStore().fragment$)).resolves.toBe(
      'test-fragment'
    );
  });

  it('exposes a selector for query params', async () => {
    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(firstValueFrom(getStore().queryParams$)).resolves.toEqual({
      ref: 'ngrx.io',
    });
  });

  it('creates a selector for a specific query param', async () => {
    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(
      firstValueFrom(getStore().selectQueryParam('ref'))
    ).resolves.toBe('ngrx.io');
  });

  it('exposes a selector for route params', async () => {
    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(firstValueFrom(getStore().routeParams$)).resolves.toEqual({
      id: 'etyDDwAAQBAJ',
    });
  });

  it('creates a selector for a specific route param', async () => {
    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(
      firstValueFrom(getStore().selectRouteParam('id'))
    ).resolves.toBe('etyDDwAAQBAJ');
  });

  it('exposes a selector for route data', async () => {
    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(firstValueFrom(getStore().routeData$)).resolves.toEqual({
      testData: 'test-data',
    });
  });

  it('exposes a selector for the URL', async () => {
    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    await expect(firstValueFrom(getStore().url$)).resolves.toBe(
      '/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment'
    );
  });
});
