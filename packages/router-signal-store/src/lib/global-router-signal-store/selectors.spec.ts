import { Component } from '@angular/core';
import { Params, Route } from '@angular/router';
import {
  DEFAULT_ROUTER_FEATURENAME,
  getRouterSelectors,
  provideRouterStore,
  routerReducer,
} from '@ngrx/router-store';
import { provideStore, Store } from '@ngrx/store';
import { createFeatureHarness } from '@ngworker/spectacular';
import { MinimalActivatedRouteSnapshot } from '../@ngrx/router-store/minimal-activated-route-state-snapshot';
import { RouterSignalStore } from '../router-signal-store';
import { StrictRouteData } from '../strict-route-data';
import { GlobalRouterSignalStore } from './global-router-signal-store';
import { provideGlobalRouterSignalStore } from './provide-global-router-signal-store';

@Component({
  standalone: true,
  template: '',
})
class DummyAuthComponent {}

describe(`${GlobalRouterSignalStore.name} selectors`, () => {
  function setup({
    data = {},
    title,
  }: {
    readonly data?: Route['data'];
    readonly title?: Route['title'];
  } = {}) {
    const featurePath = 'auth';
    const harness = createFeatureHarness({
      featurePath,
      providers: [
        provideGlobalRouterSignalStore(),
        // We compare `GlobalRouterSignalStore` to NgRx Router Store selectors
        provideStore({
          [DEFAULT_ROUTER_FEATURENAME]: routerReducer,
        }),
        provideRouterStore(),
      ],
      routes: [
        {
          path: featurePath,
          component: DummyAuthComponent,
          data,
          title,
        },
      ],
    });

    const ngrxRouterStore = getRouterSelectors();

    return {
      harness,
      ngrxRouterStore,
      get ngrxStore(): Store<object> {
        return harness.inject(Store);
      },
      get routerSignalStore(): RouterSignalStore {
        return harness.inject(RouterSignalStore);
      },
    };
  }

  it('exposes a signal for the current route', async () => {
    const { harness, routerSignalStore, ngrxRouterStore, ngrxStore } = setup();

    await harness.router.navigateByUrl('/auth');

    const expectedCurrentRoute: Partial<MinimalActivatedRouteSnapshot> =
      expect.objectContaining({
        children: [],
        data: {},
        fragment: null,
        outlet: 'primary',
        params: {},
        queryParams: {},
        routeConfig: expect.objectContaining({
          path: 'auth',
        }),
        title: undefined,
        url: [
          expect.objectContaining({
            path: 'auth',
            parameters: {},
          }),
        ],
      });

    expect(routerSignalStore.currentRoute()).toEqual(expectedCurrentRoute);
    expect(
      ngrxStore.selectSignal(ngrxRouterStore.selectCurrentRoute)()
    ).toEqual(expectedCurrentRoute);
  });

  it('exposes a signal for the route fragment', async () => {
    const { harness, routerSignalStore, ngrxRouterStore, ngrxStore } = setup();

    await harness.router.navigateByUrl('/auth#test-fragment');

    expect(routerSignalStore.fragment()).toBe('test-fragment');
    expect(ngrxStore.selectSignal(ngrxRouterStore.selectFragment)()).toBe(
      'test-fragment'
    );
  });

  it('exposes a signal for query parameters', async () => {
    const { harness, routerSignalStore, ngrxRouterStore, ngrxStore } = setup();

    await harness.router.navigateByUrl('/auth?query=param');

    const expectedQueryParams: Params = { query: 'param' };

    expect(routerSignalStore.queryParams()).toEqual(expectedQueryParams);
    expect(ngrxStore.selectSignal(ngrxRouterStore.selectQueryParams)()).toEqual(
      expectedQueryParams
    );
  });

  it('exposes a signal for a specific query parameter', async () => {
    const { harness, routerSignalStore, ngrxRouterStore, ngrxStore } = setup();

    await harness.router.navigateByUrl('/auth?query=param');

    expect(routerSignalStore.selectQueryParam('query')()).toBe('param');
    expect(
      ngrxStore.selectSignal(ngrxRouterStore.selectQueryParam('query'))()
    ).toBe('param');
  });

  it('exposes a signal for route data', async () => {
    const expectedRouteData: StrictRouteData = { test: 'data' };
    const { harness, routerSignalStore, ngrxRouterStore, ngrxStore } = setup({
      data: expectedRouteData,
    });

    await harness.router.navigateByUrl('/auth');

    expect(routerSignalStore.routeData()).toEqual(expectedRouteData);
    expect(ngrxStore.selectSignal(ngrxRouterStore.selectRouteData)()).toEqual(
      expectedRouteData
    );
  });

  it('exposes a signal for a specific route data parameter', async () => {
    const { harness, routerSignalStore, ngrxRouterStore, ngrxStore } = setup({
      data: { test: 'data' },
    });

    await harness.router.navigateByUrl('/auth');

    expect(routerSignalStore.selectRouteDataParam('test')()).toBe('data');
    expect(
      ngrxStore.selectSignal(ngrxRouterStore.selectRouteDataParam('test'))()
    ).toBe('data');
  });

  it('exposes a signal for route parameters', async () => {
    const { harness, routerSignalStore, ngrxRouterStore, ngrxStore } = setup();

    await harness.router.navigateByUrl('/auth');

    const expectedRouteParams: Params = {};

    expect(routerSignalStore.routeParams()).toEqual(expectedRouteParams);
    expect(ngrxStore.selectSignal(ngrxRouterStore.selectRouteParams)()).toEqual(
      expectedRouteParams
    );
  });

  it('exposes a signal for a specific route parameter', async () => {
    const { harness, routerSignalStore, ngrxRouterStore, ngrxStore } = setup();

    await harness.router.navigateByUrl('/auth');

    expect(routerSignalStore.selectRouteParam('missing')()).toBeUndefined();
    expect(
      ngrxStore.selectSignal(ngrxRouterStore.selectRouteParam('missing'))()
    ).toBeUndefined();
  });

  it('exposes a signal for the resolved route title', async () => {
    const expectedTitle = 'Expected title';
    const { harness, routerSignalStore, ngrxRouterStore, ngrxStore } = setup({
      title: expectedTitle,
    });

    await harness.router.navigateByUrl('/auth#test-fragment');

    expect(routerSignalStore.title()).toBe(expectedTitle);
    expect(ngrxStore.selectSignal(ngrxRouterStore.selectTitle)()).toBe(
      expectedTitle
    );
  });

  it('exposes a signal for the current URL', async () => {
    const { harness, routerSignalStore, ngrxRouterStore, ngrxStore } = setup();

    await harness.router.navigateByUrl('/auth?query=param#test-fragment');

    const expectedUrl = '/auth?query=param#test-fragment';

    expect(routerSignalStore.url()).toBe(expectedUrl);
    expect(ngrxStore.selectSignal(ngrxRouterStore.selectUrl)()).toBe(
      expectedUrl
    );
  });
});
