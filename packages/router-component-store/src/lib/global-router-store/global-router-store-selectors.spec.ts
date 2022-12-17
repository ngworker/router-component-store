import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Route, Router, RouterOutlet, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { firstValueFrom } from 'rxjs';
import { RouterStore } from '../router-store';
import { GlobalRouterStore } from './global-router-store';
import { provideGlobalRouterStore } from './provide-global-router-store';

@Component({
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
class DummyAppComponent {}

@Component({
  standalone: true,
  template: '',
})
class DummyLoginComponent {}

describe(`${GlobalRouterStore.name} selectors`, () => {
  async function setup({
    assertions = 1,
    title,
  }: {
    readonly assertions?: number;
    readonly title?: Route['title'];
  } = {}) {
    expect.assertions(assertions);
    const routes: Routes = [
      {
        path: 'login',
        children: [
          {
            path: ':id',
            component: DummyLoginComponent,
            data: { testData: 'test-data' },
            title,
          },
        ],
      },
    ];

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      providers: [provideGlobalRouterStore()],
    });

    const rootFixture = TestBed.createComponent(DummyAppComponent);
    rootFixture.autoDetectChanges(true);

    const router = TestBed.inject(Router);
    const routerStore = TestBed.inject(RouterStore);

    await router.navigateByUrl('/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment');

    return {
      routerStore,
    };
  }

  it('exposes a selector for the current route', async () => {
    const { routerStore } = await setup({
      title: 'Static title',
    });

    await expect(firstValueFrom(routerStore.currentRoute$)).resolves.toEqual({
      children: [],
      data: {
        testData: 'test-data',
      },
      fragment: 'test-fragment',
      outlet: 'primary',
      params: {
        id: 'etyDDwAAQBAJ',
      },
      queryParams: {
        ref: 'ngrx.io',
      },
      routeConfig: {
        path: ':id',
        title: 'Static title',
      },
      title: 'Static title',
      url: [
        {
          path: 'etyDDwAAQBAJ',
          parameters: {},
        },
      ],
    });
  });

  it('exposes a selector for the fragment', async () => {
    const { routerStore } = await setup();

    await expect(firstValueFrom(routerStore.fragment$)).resolves.toBe(
      'test-fragment'
    );
  });

  it('exposes a selector for query params', async () => {
    const { routerStore } = await setup();

    await expect(firstValueFrom(routerStore.queryParams$)).resolves.toEqual({
      ref: 'ngrx.io',
    });
  });

  it('creates a selector for a specific query param', async () => {
    const { routerStore } = await setup();

    await expect(
      firstValueFrom(routerStore.selectQueryParam('ref'))
    ).resolves.toBe('ngrx.io');
  });

  it('exposes a selector for route params', async () => {
    const { routerStore } = await setup();

    await expect(firstValueFrom(routerStore.routeParams$)).resolves.toEqual({
      id: 'etyDDwAAQBAJ',
    });
  });

  it('creates a selector for a specific route param', async () => {
    const { routerStore } = await setup();

    await expect(
      firstValueFrom(routerStore.selectRouteParam('id'))
    ).resolves.toBe('etyDDwAAQBAJ');
  });

  it('exposes a selector for route data', async () => {
    const { routerStore } = await setup();

    await expect(firstValueFrom(routerStore.routeData$)).resolves.toEqual({
      testData: 'test-data',
    });
  });

  it('creates a selector for specific route data', async () => {
    const { routerStore } = await setup();

    await expect(
      firstValueFrom(routerStore.selectRouteData<string>('testData'))
    ).resolves.toBe('test-data');
  });

  it('exposes a selector for the URL', async () => {
    const { routerStore } = await setup();

    await expect(firstValueFrom(routerStore.url$)).resolves.toBe(
      '/login/etyDDwAAQBAJ?ref=ngrx.io#test-fragment'
    );
  });

  it('exposes a selector for the route title that emits static route titles', async () => {
    const { routerStore } = await setup({
      title: 'Static title',
    });

    await expect(firstValueFrom(routerStore.title$)).resolves.toBe(
      'Static title'
    );
  });

  it('exposes a selector for the route title that emits resolved route titles', async () => {
    const { routerStore } = await setup({
      title: (route) => route.data['testData'],
    });

    await expect(firstValueFrom(routerStore.title$)).resolves.toBe('test-data');
  });
});
