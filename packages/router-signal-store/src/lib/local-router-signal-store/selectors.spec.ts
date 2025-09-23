import { Component, Injector, Type } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Route } from '@angular/router';
import { createFeatureHarness } from '@ngworker/spectacular';
import { RouterSignalStore } from '../router-signal-store';
import { LocalRouterSignalStore } from './local-router-signal-store';
import { provideLocalRouterSignalStore } from './provide-local-router-signal-store';

@Component({
  standalone: true,
  viewProviders: [provideLocalRouterSignalStore()],
  template: '',
})
class DummyAuthComponent {}

describe(`${LocalRouterSignalStore.name} selectors`, () => {
  async function setup({
    data = {},
    title,
  }: {
    readonly data?: Route['data'];
    readonly title?: Route['title'];
  } = {}) {
    const featurePath = 'auth';
    const harness = createFeatureHarness({
      featurePath,
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

    await harness.router.navigateByUrl(
      '~/jnBGhzQEWtYv?ref=ngworker.github.io#test-fragment'
    );

    return {
      harness,
      injectorFor<TComponent>(ComponentType: Type<TComponent>): Injector {
        return harness.rootFixture.debugElement.query(
          By.directive(ComponentType)
        ).injector;
      },
    };
  }

  it('exposes a signal for the current route', async () => {
    const { harness, injectorFor } = await setup({
      data: {
        testData: 'test-data',
      },
      title: 'Static title',
    });

    await harness.router.navigateByUrl(
      '~/TrmAXFHwmQwd?ref=ngworker.github.io#test-fragment'
    );

    const currentRoute = injectorFor(DummyAuthComponent)
      .get(RouterSignalStore)
      .currentRoute();

    expect(currentRoute).toEqual({
      children: [],
      data: {
        testData: 'test-data',
      },
      fragment: 'test-fragment',
      outlet: 'primary',
      params: {
        token: 'TrmAXFHwmQwd',
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
          path: 'TrmAXFHwmQwd',
          parameters: {},
        },
      ],
    });
  });

  it('exposes a signal for the fragment', async () => {
    const { harness, injectorFor } = await setup();

    await harness.router.navigateByUrl(
      '~/VtwXNTjucDtY?ref=ngworker.github.io#test-fragment'
    );

    expect(
      injectorFor(DummyAuthComponent).get(RouterSignalStore).fragment()
    ).toBe('test-fragment');
  });

  it(`exposes a signal for the fragment matching ${ActivatedRoute.name}#fragment`, async () => {
    const { harness, injectorFor } = await setup();

    await harness.router.navigateByUrl(
      '~/VtwXNTjucDtY?ref=ngworker.github.io#test-fragment'
    );

    const routerSignalStoreFragment = injectorFor(DummyAuthComponent)
      .get(RouterSignalStore)
      .fragment();
    const activatedRouteFragment =
      injectorFor(DummyAuthComponent).get(ActivatedRoute).snapshot.fragment;

    expect(routerSignalStoreFragment).toBe(activatedRouteFragment);
  });

  it('exposes a signal for query params', async () => {
    const { harness, injectorFor } = await setup();

    await harness.router.navigateByUrl(
      '~/JPJUnbTUtruT?ref=ngworker.github.io#test-fragment'
    );

    expect(
      injectorFor(DummyAuthComponent).get(RouterSignalStore).queryParams()
    ).toEqual({
      ref: 'ngworker.github.io',
    });
  });

  it(`exposes a signal for query params matching ${ActivatedRoute.name}#queryParams`, async () => {
    const { harness, injectorFor } = await setup();

    await harness.router.navigateByUrl(
      '~/JPJUnbTUtruT?ref=ngworker.github.io#test-fragment'
    );

    const routerSignalStoreQueryParams = injectorFor(DummyAuthComponent)
      .get(RouterSignalStore)
      .queryParams();
    const activatedRouteQueryParams =
      injectorFor(DummyAuthComponent).get(ActivatedRoute).snapshot.queryParams;

    expect(routerSignalStoreQueryParams).toEqual(activatedRouteQueryParams);
  });

  it('creates a signal for a specific query param', async () => {
    const { harness, injectorFor } = await setup();

    await harness.router.navigateByUrl(
      '~/ccrfBcnKrfDW?ref=ngworker.github.io#test-fragment'
    );

    expect(
      injectorFor(DummyAuthComponent)
        .get(RouterSignalStore)
        .selectQueryParam('ref')()
    ).toBe('ngworker.github.io');
  });

  it('exposes a signal for route params', async () => {
    const { harness, injectorFor } = await setup();

    await harness.router.navigateByUrl(
      '~/vpXxPMkvtTGw?ref=ngworker.github.io#test-fragment'
    );

    expect(
      injectorFor(DummyAuthComponent).get(RouterSignalStore).routeParams()
    ).toEqual({
      token: 'vpXxPMkvtTGw',
    });
  });

  it(`exposes a signal for route params matching ${ActivatedRoute.name}#params`, async () => {
    const { harness, injectorFor } = await setup();

    await harness.router.navigateByUrl(
      '~/vpXxPMkvtTGw?ref=ngworker.github.io#test-fragment'
    );

    const routerSignalStoreRouteParams = injectorFor(DummyAuthComponent)
      .get(RouterSignalStore)
      .routeParams();
    const activatedRouteParams =
      injectorFor(DummyAuthComponent).get(ActivatedRoute).snapshot.params;

    expect(routerSignalStoreRouteParams).toEqual(activatedRouteParams);
  });

  it('creates a signal for a specific route param', async () => {
    const { harness, injectorFor } = await setup();

    await harness.router.navigateByUrl(
      '~/ndcZUxDDsyjY?ref=ngworker.github.io#test-fragment'
    );

    expect(
      injectorFor(DummyAuthComponent)
        .get(RouterSignalStore)
        .selectRouteParam('token')()
    ).toBe('ndcZUxDDsyjY');
  });

  it('exposes a signal for route data', async () => {
    const { harness, injectorFor } = await setup({
      data: {
        testData: 'test-data',
      },
    });

    await harness.router.navigateByUrl(
      '~/wRWxnzmPTwPn?ref=ngworker.github.io#test-fragment'
    );

    expect(
      injectorFor(DummyAuthComponent).get(RouterSignalStore).routeData()
    ).toEqual({
      testData: 'test-data',
    });
  });

  it(`exposes a signal for route data matching ${ActivatedRoute.name}#data`, async () => {
    const { harness, injectorFor } = await setup({
      data: {
        testData: 'test-data',
      },
    });

    await harness.router.navigateByUrl(
      '~/wRWxnzmPTwPn?ref=ngworker.github.io#test-fragment'
    );

    const routerSignalStoreRouteData = injectorFor(DummyAuthComponent)
      .get(RouterSignalStore)
      .routeData();
    const activatedRouteData =
      injectorFor(DummyAuthComponent).get(ActivatedRoute).snapshot.data;

    expect(routerSignalStoreRouteData).toEqual(activatedRouteData);
  });

  it('creates a signal for specific route data', async () => {
    const { harness, injectorFor } = await setup({
      data: {
        testData: 'test-data',
      },
    });

    await harness.router.navigateByUrl(
      '~/ujZQmfrvXpkE?ref=ngworker.github.io#test-fragment'
    );

    expect(
      injectorFor(DummyAuthComponent)
        .get(RouterSignalStore)
        .selectRouteDataParam('testData')()
    ).toBe('test-data');
  });

  it('exposes a signal for the URL', async () => {
    const { harness, injectorFor } = await setup();

    await harness.router.navigateByUrl(
      '~/AQtsDDkyBnMv?ref=ngworker.github.io#test-fragment'
    );

    expect(injectorFor(DummyAuthComponent).get(RouterSignalStore).url()).toBe(
      '/auth/AQtsDDkyBnMv?ref=ngworker.github.io#test-fragment'
    );
  });

  it('exposes a signal for the route title that emits static route titles', async () => {
    const { harness, injectorFor } = await setup({
      title: 'Static title',
    });

    await harness.router.navigateByUrl(
      '~/mZkqKzTpJpga?ref=ngworker.github.io#test-fragment'
    );

    expect(injectorFor(DummyAuthComponent).get(RouterSignalStore).title()).toBe(
      'Static title'
    );
  });

  it('exposes a signal for the route title that emits resolved route titles', async () => {
    const { harness, injectorFor } = await setup({
      data: {
        testData: 'test-data',
      },
      title: (route) => route.data['testData'],
    });

    await harness.router.navigateByUrl(
      '~/HwVztCWzjCBv?ref=ngworker.github.io#test-fragment'
    );

    expect(injectorFor(DummyAuthComponent).get(RouterSignalStore).title()).toBe(
      'test-data'
    );
  });
});
