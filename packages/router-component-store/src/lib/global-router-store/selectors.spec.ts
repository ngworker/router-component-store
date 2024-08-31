import { Component } from '@angular/core';
import {
  NavigationEnd,
  NavigationStart,
  Params,
  Route,
  Router,
  UrlSegment,
} from '@angular/router';
import {
  DEFAULT_ROUTER_FEATURENAME,
  getSelectors,
  provideRouterStore,
  routerReducer,
} from '@ngrx/router-store';
import { provideStore, Store } from '@ngrx/store';
import { createFeatureHarness } from '@ngworker/spectacular';
import { filter, firstValueFrom, take, toArray } from 'rxjs';
import { MinimalActivatedRouteSnapshot } from '../@ngrx/router-store/minimal-activated-route-state-snapshot';
import { MinimalRouteData } from '../minimal-route-data';
import { RouterStore } from '../router-store';
import { GlobalRouterStore } from './global-router-store';
import { provideGlobalRouterStore } from './provide-global-router-store';

@Component({
  standalone: true,
  template: '',
})
class DummyAuthComponent {}

describe(`${GlobalRouterStore.name} selectors`, () => {
  function setup({
    assertions = 2,
    data = {},
    title,
  }: {
    readonly assertions?: number;
    readonly data?: Route['data'];
    readonly title?: Route['title'];
  } = {}) {
    expect.assertions(assertions);

    const featurePath = 'auth';
    const harness = createFeatureHarness({
      featurePath,
      providers: [
        provideGlobalRouterStore(),
        // We compare `GlobalRouterStore` to NgRx Router Store selectors
        provideStore({
          [DEFAULT_ROUTER_FEATURENAME]: routerReducer,
        }),
        provideRouterStore(),
      ],
      routes: [
        {
          path: featurePath,
          children: [
            {
              path: ':token',
              component: DummyAuthComponent,
              data,
              title,
            },
          ],
        },
      ],
    });

    return {
      harness,
      get ngrxRouterStore() {
        return getSelectors();
      },
    };
  }

  it('exposes a selector for the current route', async () => {
    const { harness, ngrxRouterStore } = setup({
      data: {
        testData: 'test-data',
      },
      title: 'Static title',
    });

    await harness.router.navigateByUrl(
      '~/bqbNGrezShfz?ref=ngworker.github.io#test-fragment'
    );

    const expectedRouteSnapshot: MinimalActivatedRouteSnapshot = {
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
      url: [new UrlSegment('bqbNGrezShfz', {})],
    };
    await expect(
      firstValueFrom(harness.inject(RouterStore).currentRoute$)
    ).resolves.toEqual(expectedRouteSnapshot);
    await expect(
      firstValueFrom(
        harness.inject(Store).select(ngrxRouterStore.selectCurrentRoute)
      )
    ).resolves.toEqual({
      ...expectedRouteSnapshot,
      // NOTE(@LayZeeDK) Seems to be a bug in NgRx Router Store 15.0.0
      title: undefined,
    });
  });

  it('exposes a selector for the fragment', async () => {
    const { harness, ngrxRouterStore } = setup();

    await harness.router.navigateByUrl(
      '~/FvQBMBzAbNbZ?ref=ngworker.github.io#test-fragment'
    );

    const expectedFragment = 'test-fragment';
    await expect(
      firstValueFrom(harness.inject(RouterStore).fragment$)
    ).resolves.toBe(expectedFragment);
    await expect(
      firstValueFrom(
        harness.inject(Store).select(ngrxRouterStore.selectFragment)
      )
    ).resolves.toBe(expectedFragment);
  });

  it('exposes a selector for query params', async () => {
    const { harness, ngrxRouterStore } = setup();

    await harness.router.navigateByUrl(
      '~/SfBGZmaAHqSn?ref=ngworker.github.io#test-fragment'
    );

    const expectedQueryParams: Params = {
      ref: 'ngworker.github.io',
    };
    await expect(
      firstValueFrom(harness.inject(RouterStore).queryParams$)
    ).resolves.toEqual(expectedQueryParams);
    await expect(
      firstValueFrom(
        harness.inject(Store).select(ngrxRouterStore.selectQueryParams)
      )
    ).resolves.toEqual(expectedQueryParams);
  });

  it('creates a selector for a specific query param', async () => {
    const { harness, ngrxRouterStore } = setup();

    await harness.router.navigateByUrl(
      '~/bSbebKhzfKkg?ref=ngworker.github.io#test-fragment'
    );

    const expectedRef = 'ngworker.github.io';
    await expect(
      firstValueFrom(harness.inject(RouterStore).selectQueryParam('ref'))
    ).resolves.toBe(expectedRef);
    await expect(
      firstValueFrom(
        harness.inject(Store).select(ngrxRouterStore.selectQueryParam('ref'))
      )
    ).resolves.toBe(expectedRef);
  });

  it('exposes a selector for route params', async () => {
    const { harness, ngrxRouterStore } = setup();

    await harness.router.navigateByUrl(
      '~/tBmuJXFZNEdC?ref=ngworker.github.io#test-fragment'
    );

    const expectedRouteParams: Params = {
      token: 'tBmuJXFZNEdC',
    };
    await expect(
      firstValueFrom(harness.inject(RouterStore).routeParams$)
    ).resolves.toEqual(expectedRouteParams);
    await expect(
      firstValueFrom(
        harness.inject(Store).select(ngrxRouterStore.selectRouteParams)
      )
    ).resolves.toEqual(expectedRouteParams);
  });

  it('creates a selector for a specific route param', async () => {
    const { harness, ngrxRouterStore } = setup();

    await harness.router.navigateByUrl(
      '~/huHynaJHbGxU?ref=ngworker.github.io#test-fragment'
    );

    const expectedToken = 'huHynaJHbGxU';
    await expect(
      firstValueFrom(harness.inject(RouterStore).selectRouteParam('token'))
    ).resolves.toBe(expectedToken);
    await expect(
      firstValueFrom(
        harness.inject(Store).select(ngrxRouterStore.selectRouteParam('token'))
      )
    ).resolves.toBe(expectedToken);
  });

  it('exposes a selector for route data', async () => {
    const expectedRouteData: MinimalRouteData = {
      testData: 'test-data',
    };
    const { harness, ngrxRouterStore } = setup({
      data: expectedRouteData,
    });

    await harness.router.navigateByUrl(
      '~/VDhyGSDTYfvz?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(harness.inject(RouterStore).routeData$)
    ).resolves.toEqual(expectedRouteData);
    await expect(
      firstValueFrom(
        harness.inject(Store).select(ngrxRouterStore.selectRouteData)
      )
    ).resolves.toEqual(expectedRouteData);
  });

  it('creates a selector for specific route data', async () => {
    const expectedTestData = 'test-data';
    const { harness, ngrxRouterStore } = setup({
      data: {
        testData: expectedTestData,
      },
    });

    await harness.router.navigateByUrl(
      '~/SFUXQFSDgMyw?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(harness.inject(RouterStore).selectRouteData('testData'))
    ).resolves.toBe(expectedTestData);
    await expect(
      firstValueFrom(
        harness.inject(Store).select(ngrxRouterStore.selectRouteData)
      )
    ).resolves.toEqual({
      testData: expectedTestData,
    });
  });

  it('exposes a selector for the URL', async () => {
    const { harness, ngrxRouterStore } = setup();

    await harness.router.navigateByUrl(
      '~/yGEJHVwByWWN?ref=ngworker.github.io#test-fragment'
    );

    const expectedUrl =
      '/auth/yGEJHVwByWWN?ref=ngworker.github.io#test-fragment';
    await expect(
      firstValueFrom(harness.inject(RouterStore).url$)
    ).resolves.toBe(expectedUrl);
    await expect(
      firstValueFrom(harness.inject(Store).select(ngrxRouterStore.selectUrl))
    ).resolves.toBe(expectedUrl);
  });

  it('exposes a selector for the route title that emits static route titles', async () => {
    const expectedTitle = 'Static title';
    const { harness, ngrxRouterStore } = setup({
      title: expectedTitle,
    });

    await harness.router.navigateByUrl(
      '~/HNxnyXeWMsac?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(harness.inject(RouterStore).title$)
    ).resolves.toBe(expectedTitle);
    await expect(
      firstValueFrom(harness.inject(Store).select(ngrxRouterStore.selectTitle))
    ).resolves.toBe(expectedTitle);
  });

  it('exposes a selector for the route title that emits resolved route titles', async () => {
    const expectedTitle = 'test-data';
    const { harness, ngrxRouterStore } = setup({
      data: {
        testData: expectedTitle,
      },
      title: (route) => route.data['testData'],
    });

    await harness.router.navigateByUrl(
      '~/vAkSruKJBpEd?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(harness.inject(RouterStore).title$)
    ).resolves.toBe(expectedTitle);
    await expect(
      firstValueFrom(harness.inject(Store).select(ngrxRouterStore.selectTitle))
    ).resolves.toBe(
      // NOTE(@LayZeeDK) Seems to be a bug in NgRx Router Store 15.0.0
      undefined
    );
  });

  it('exposes a selector for specific router events', async () => {
    const { harness } = setup();
    const expectedUrl =
      '/auth/tzrVGffgbTmv?ref=ngworker.github.io#test-fragment';
    const navigation$ = harness
      .inject(RouterStore)
      .selectRouterEvents(NavigationStart, NavigationEnd);
    const whenNavigation = firstValueFrom(navigation$.pipe(take(2), toArray()));
    const angularRouterNavigation$ = harness
      .inject(Router)
      .events.pipe(
        filter(
          (event): event is NavigationStart | NavigationEnd =>
            event instanceof NavigationStart || event instanceof NavigationEnd
        )
      );
    const whenAngularRouterNavigation = firstValueFrom(
      angularRouterNavigation$.pipe(take(2), toArray())
    );

    await harness.router.navigateByUrl(expectedUrl);

    const expectedNavigation: [NavigationStart, NavigationEnd] = [
      new NavigationStart(2, expectedUrl),
      new NavigationEnd(2, expectedUrl, expectedUrl),
    ];
    await expect(whenNavigation).resolves.toEqual(expectedNavigation);
    await expect(whenAngularRouterNavigation).resolves.toEqual(
      expectedNavigation
    );
  });
});
