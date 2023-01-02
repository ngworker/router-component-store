import { Component, NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  NavigationEnd,
  NavigationStart,
  Route,
  Router,
  RouterOutlet,
  Routes,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { firstValueFrom, take, toArray } from 'rxjs';
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
class DummyAuthComponent {}

describe(`${GlobalRouterStore.name} selectors`, () => {
  async function setup({
    assertions = 1,
    data = {},
    title,
  }: {
    readonly assertions?: number;
    readonly data?: Route['data'];
    readonly title?: Route['title'];
  } = {}) {
    function navigateByUrl(url: string) {
      return ngZone.run(() => router.navigateByUrl(url));
    }

    expect.assertions(assertions);

    const routes: Routes = [
      {
        path: 'auth',
        children: [
          {
            path: ':token',
            component: DummyAuthComponent,
            data,
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

    const ngZone = TestBed.inject(NgZone);
    const router = TestBed.inject(Router);
    const routerStore = TestBed.inject(RouterStore);

    return {
      navigateByUrl,
      routerStore,
    };
  }

  it('exposes a selector for the current route', async () => {
    const { navigateByUrl, routerStore } = await setup({
      data: {
        testData: 'test-data',
      },
      title: 'Static title',
    });

    await navigateByUrl(
      '/auth/bqbNGrezShfz?ref=ngworker.github.io#test-fragment'
    );

    await expect(firstValueFrom(routerStore.currentRoute$)).resolves.toEqual({
      children: [],
      data: {
        testData: 'test-data',
      },
      fragment: 'test-fragment',
      outlet: 'primary',
      params: {
        token: 'bqbNGrezShfz',
      },
      queryParams: {
        ref: 'ngworker.github.io',
      },
      routeConfig: {
        path: ':token',
        title: 'Static title',
      },
      title: 'Static title',
      url: [
        {
          path: 'bqbNGrezShfz',
          parameters: {},
        },
      ],
    });
  });

  it('exposes a selector for the fragment', async () => {
    const { navigateByUrl, routerStore } = await setup();

    await navigateByUrl(
      '/auth/FvQBMBzAbNbZ?ref=ngworker.github.io#test-fragment'
    );

    await expect(firstValueFrom(routerStore.fragment$)).resolves.toBe(
      'test-fragment'
    );
  });

  it('exposes a selector for query params', async () => {
    const { navigateByUrl, routerStore } = await setup();

    await navigateByUrl(
      '/auth/SfBGZmaAHqSn?ref=ngworker.github.io#test-fragment'
    );

    await expect(firstValueFrom(routerStore.queryParams$)).resolves.toEqual({
      ref: 'ngworker.github.io',
    });
  });

  it('creates a selector for a specific query param', async () => {
    const { navigateByUrl, routerStore } = await setup();

    await navigateByUrl(
      '/auth/bSbebKhzfKkg?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(routerStore.selectQueryParam('ref'))
    ).resolves.toBe('ngworker.github.io');
  });

  it('exposes a selector for route params', async () => {
    const { navigateByUrl, routerStore } = await setup();

    await navigateByUrl(
      '/auth/tBmuJXFZNEdC?ref=ngworker.github.io#test-fragment'
    );

    await expect(firstValueFrom(routerStore.routeParams$)).resolves.toEqual({
      token: 'tBmuJXFZNEdC',
    });
  });

  it('creates a selector for a specific route param', async () => {
    const { navigateByUrl, routerStore } = await setup();

    await navigateByUrl(
      '/auth/huHynaJHbGxU?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(routerStore.selectRouteParam('token'))
    ).resolves.toBe('huHynaJHbGxU');
  });

  it('exposes a selector for route data', async () => {
    const { navigateByUrl, routerStore } = await setup({
      data: {
        testData: 'test-data',
      },
    });

    await navigateByUrl(
      '/auth/VDhyGSDTYfvz?ref=ngworker.github.io#test-fragment'
    );

    await expect(firstValueFrom(routerStore.routeData$)).resolves.toEqual({
      testData: 'test-data',
    });
  });

  it('creates a selector for specific route data', async () => {
    const { navigateByUrl, routerStore } = await setup({
      data: {
        testData: 'test-data',
      },
    });

    await navigateByUrl(
      '/auth/SFUXQFSDgMyw?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(routerStore.selectRouteData<string>('testData'))
    ).resolves.toBe('test-data');
  });

  it('exposes a selector for the URL', async () => {
    const { navigateByUrl, routerStore } = await setup();

    await navigateByUrl(
      '/auth/yGEJHVwByWWN?ref=ngworker.github.io#test-fragment'
    );

    await expect(firstValueFrom(routerStore.url$)).resolves.toBe(
      '/auth/yGEJHVwByWWN?ref=ngworker.github.io#test-fragment'
    );
  });

  it('exposes a selector for the route title that emits static route titles', async () => {
    const { navigateByUrl, routerStore } = await setup({
      title: 'Static title',
    });

    await navigateByUrl(
      '/auth/HNxnyXeWMsac?ref=ngworker.github.io#test-fragment'
    );

    await expect(firstValueFrom(routerStore.title$)).resolves.toBe(
      'Static title'
    );
  });

  it('exposes a selector for the route title that emits resolved route titles', async () => {
    const { navigateByUrl, routerStore } = await setup({
      data: {
        testData: 'test-data',
      },
      title: (route) => route.data['testData'],
    });

    await navigateByUrl(
      '/auth/vAkSruKJBpEd?ref=ngworker.github.io#test-fragment'
    );

    await expect(firstValueFrom(routerStore.title$)).resolves.toBe('test-data');
  });

  it('exposes a selector for specific router events', async () => {
    const { navigateByUrl, routerStore } = await setup();
    const expectedUrl =
      '/auth/tzrVGffgbTmv?ref=ngworker.github.io#test-fragment';
    const navigation$ = routerStore.selectRouterEvents(
      NavigationStart,
      NavigationEnd
    );
    const whenNavigation = firstValueFrom(navigation$.pipe(take(2), toArray()));

    await navigateByUrl(expectedUrl);

    await expect(whenNavigation).resolves.toEqual([
      new NavigationStart(1, expectedUrl),
      new NavigationEnd(1, expectedUrl, expectedUrl),
    ]);
  });
});
