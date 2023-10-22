import { Component } from '@angular/core';
import { NavigationEnd, NavigationStart, Route } from '@angular/router';
import { createFeatureHarness } from '@ngworker/spectacular';
import { firstValueFrom, take, toArray } from 'rxjs';
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
    assertions = 1,
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
      providers: [provideGlobalRouterStore()],
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
    };
  }

  it('exposes a selector for the current route', async () => {
    const { harness } = setup({
      data: {
        testData: 'test-data',
      },
      title: 'Static title',
    });

    await harness.router.navigateByUrl(
      '~/bqbNGrezShfz?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(harness.inject(RouterStore).currentRoute$)
    ).resolves.toEqual({
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
    const { harness } = setup();

    await harness.router.navigateByUrl(
      '~/FvQBMBzAbNbZ?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(harness.inject(RouterStore).fragment$)
    ).resolves.toBe('test-fragment');
  });

  it('exposes a selector for query params', async () => {
    const { harness } = setup();

    await harness.router.navigateByUrl(
      '~/SfBGZmaAHqSn?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(harness.inject(RouterStore).queryParams$)
    ).resolves.toEqual({
      ref: 'ngworker.github.io',
    });
  });

  it('creates a selector for a specific query param', async () => {
    const { harness } = setup();

    await harness.router.navigateByUrl(
      '~/bSbebKhzfKkg?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(harness.inject(RouterStore).selectQueryParam('ref'))
    ).resolves.toBe('ngworker.github.io');
  });

  it('exposes a selector for route params', async () => {
    const { harness } = setup();

    await harness.router.navigateByUrl(
      '~/tBmuJXFZNEdC?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(harness.inject(RouterStore).routeParams$)
    ).resolves.toEqual({
      token: 'tBmuJXFZNEdC',
    });
  });

  it('creates a selector for a specific route param', async () => {
    const { harness } = setup();

    await harness.router.navigateByUrl(
      '~/huHynaJHbGxU?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(harness.inject(RouterStore).selectRouteParam('token'))
    ).resolves.toBe('huHynaJHbGxU');
  });

  it('exposes a selector for route data', async () => {
    const { harness } = setup({
      data: {
        testData: 'test-data',
      },
    });

    await harness.router.navigateByUrl(
      '~/VDhyGSDTYfvz?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(harness.inject(RouterStore).routeData$)
    ).resolves.toEqual({
      testData: 'test-data',
    });
  });

  it('creates a selector for specific route data', async () => {
    const { harness } = setup({
      data: {
        testData: 'test-data',
      },
    });

    await harness.router.navigateByUrl(
      '~/SFUXQFSDgMyw?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(
        harness.inject(RouterStore).selectRouteData<string>('testData')
      )
    ).resolves.toBe('test-data');
  });

  it('exposes a selector for the URL', async () => {
    const { harness } = setup();

    await harness.router.navigateByUrl(
      '~/yGEJHVwByWWN?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(harness.inject(RouterStore).url$)
    ).resolves.toBe('/auth/yGEJHVwByWWN?ref=ngworker.github.io#test-fragment');
  });

  it('exposes a selector for the route title that emits static route titles', async () => {
    const { harness } = setup({
      title: 'Static title',
    });

    await harness.router.navigateByUrl(
      '~/HNxnyXeWMsac?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(harness.inject(RouterStore).title$)
    ).resolves.toBe('Static title');
  });

  it('exposes a selector for the route title that emits resolved route titles', async () => {
    const { harness } = setup({
      data: {
        testData: 'test-data',
      },
      title: (route) => route.data['testData'],
    });

    await harness.router.navigateByUrl(
      '~/vAkSruKJBpEd?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(harness.inject(RouterStore).title$)
    ).resolves.toBe('test-data');
  });

  it('exposes a selector for specific router events', async () => {
    const { harness } = setup();
    const expectedUrl =
      '/auth/tzrVGffgbTmv?ref=ngworker.github.io#test-fragment';
    const navigation$ = harness
      .inject(RouterStore)
      .selectRouterEvents(NavigationStart, NavigationEnd);
    const whenNavigation = firstValueFrom(navigation$.pipe(take(2), toArray()));

    await harness.router.navigateByUrl(expectedUrl);

    await expect(whenNavigation).resolves.toEqual([
      new NavigationStart(2, expectedUrl),
      new NavigationEnd(2, expectedUrl, expectedUrl),
    ]);
  });
});
