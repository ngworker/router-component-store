import { Component } from '@angular/core';
import { Route } from '@angular/router';
import { createFeatureHarness } from '@ngworker/spectacular';
import { MinimalActivatedRouteSnapshot } from '../@ngrx/router-store/minimal-activated-route-state-snapshot';
import { RouterStore } from '../router-store';
import { StrictRouteData } from '../strict-route-data';
import { GlobalRouterStore } from './global-router-store';
import { provideGlobalRouterStore } from './provide-global-router-store';

@Component({
  standalone: true,
  template: '',
})
class DummyAuthComponent {}

describe(`${GlobalRouterStore.name} selectors`, () => {
  function setup({
    data = {},
    title,
  }: {
    readonly data?: Route['data'];
    readonly title?: Route['title'];
  } = {}) {
    const harness = createFeatureHarness({
      featurePath: '',
      providers: [provideGlobalRouterStore()],
      routes: [
        {
          path: ':token',
          component: DummyAuthComponent,
          data,
          title,
        },
      ],
    });

    return { harness };
  }

  it('exposes a selector for the current route', async () => {
    const { harness } = setup({
      data: {
        testData: 'test-data',
      },
      title: 'Static title',
    });

    await harness.router.navigateByUrl('/bqbNGrezShfz?ref=ngworker.github.io#test-fragment');

    const expectedRouteSnapshot: Partial<MinimalActivatedRouteSnapshot> = {
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
      title: 'Static title',
    };

    const currentRoute = harness.inject(RouterStore).currentRoute();
    expect(currentRoute).toEqual(
      expect.objectContaining(expectedRouteSnapshot)
    );
  });

  it('exposes a selector for route data', async () => {
    const expectedRouteData: StrictRouteData = {
      testData: 'test-data',
    };
    const { harness } = setup({
      data: expectedRouteData,
    });

    await harness.router.navigateByUrl('/VDhyGSDTYfvz?ref=ngworker.github.io#test-fragment');

    const routeData = harness.inject(RouterStore).routeData();
    expect(routeData).toEqual(expectedRouteData);
  });

  it('creates a selector for specific route data', async () => {
    const expectedTestData = 'test-data';
    const { harness } = setup({
      data: {
        testData: expectedTestData,
      },
    });

    await harness.router.navigateByUrl('/SFUXQFSDgMyw?ref=ngworker.github.io#test-fragment');

    const testData = harness.inject(RouterStore).selectRouteDataParam('testData')();
    expect(testData).toBe(expectedTestData);
  });

  it('creates a selector for a specific query parameter', async () => {
    const { harness } = setup();

    await harness.router.navigateByUrl('/vOaURFhUDkYN?ref=ngworker.github.io#test-fragment');

    const ref = harness.inject(RouterStore).selectQueryParam('ref')();
    expect(ref).toBe('ngworker.github.io');
  });

  it('creates a selector for a specific route parameter', async () => {
    const { harness } = setup();

    await harness.router.navigateByUrl('/token?ref=ngworker.github.io#test-fragment');

    const token = harness.inject(RouterStore).selectRouteParam('token')();
    expect(token).toBe('token');
  });
});