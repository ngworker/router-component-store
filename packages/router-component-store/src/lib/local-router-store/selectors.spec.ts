import { Component, Injector, Type } from '@angular/core';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  Route,
} from '@angular/router';
import { createFeatureHarness } from '@ngworker/spectacular';
import { firstValueFrom, take, toArray } from 'rxjs';
import { RouterStore } from '../router-store';
import { LocalRouterStore } from './local-router-store';
import { provideLocalRouterStore } from './provide-local-router-store';

@Component({
  standalone: true,
  viewProviders: [provideLocalRouterStore()],
  template: '',
})
class DummyAuthComponent {}

describe(`${LocalRouterStore.name} selectors`, () => {
  async function setup({
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

  it('exposes a selector for the current route', async () => {
    const { harness, injectorFor } = await setup({
      data: {
        testData: 'test-data',
      },
      title: 'Static title',
    });

    await harness.router.navigateByUrl(
      '~/TrmAXFHwmQwd?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(
        injectorFor(DummyAuthComponent).get(RouterStore).currentRoute$
      )
    ).resolves.toEqual({
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

  it('exposes a selector for the fragment', async () => {
    const { harness, injectorFor } = await setup();

    await harness.router.navigateByUrl(
      '~/VtwXNTjucDtY?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(injectorFor(DummyAuthComponent).get(RouterStore).fragment$)
    ).resolves.toBe('test-fragment');
  });

  it(`exposts a selector for the fragment matching ${ActivatedRoute.name}#fragment`, async () => {
    const { harness, injectorFor } = await setup();

    await harness.router.navigateByUrl(
      '~/VtwXNTjucDtY?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(injectorFor(DummyAuthComponent).get(RouterStore).fragment$)
    ).resolves.toBe(
      await firstValueFrom(
        injectorFor(DummyAuthComponent).get(ActivatedRoute).fragment
      )
    );
  });

  it('exposes a selector for query params', async () => {
    const { harness, injectorFor } = await setup();

    await harness.router.navigateByUrl(
      '~/JPJUnbTUtruT?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(
        injectorFor(DummyAuthComponent).get(RouterStore).queryParams$
      )
    ).resolves.toEqual({
      ref: 'ngworker.github.io',
    });
  });

  it(`exposes a selector for query params matching ${ActivatedRoute.name}#queryParams`, async () => {
    const { harness, injectorFor } = await setup();

    await harness.router.navigateByUrl(
      '~/JPJUnbTUtruT?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(
        injectorFor(DummyAuthComponent).get(RouterStore).queryParams$
      )
    ).resolves.toEqual(
      await firstValueFrom(
        injectorFor(DummyAuthComponent).get(ActivatedRoute).queryParams
      )
    );
  });

  it('creates a selector for a specific query param', async () => {
    const { harness, injectorFor } = await setup();

    await harness.router.navigateByUrl(
      '~/ccrfBcnKrfDW?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(
        injectorFor(DummyAuthComponent).get(RouterStore).selectQueryParam('ref')
      )
    ).resolves.toBe('ngworker.github.io');
  });

  it('exposes a selector for route params', async () => {
    const { harness, injectorFor } = await setup();

    await harness.router.navigateByUrl(
      '~/vpXxPMkvtTGw?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(
        injectorFor(DummyAuthComponent).get(RouterStore).routeParams$
      )
    ).resolves.toEqual({
      token: 'vpXxPMkvtTGw',
    });
  });

  it(`exposes a selector for route params matching ${ActivatedRoute.name}#params`, async () => {
    const { harness, injectorFor } = await setup();

    await harness.router.navigateByUrl(
      '~/vpXxPMkvtTGw?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(
        injectorFor(DummyAuthComponent).get(RouterStore).routeParams$
      )
    ).resolves.toEqual(
      await firstValueFrom(
        injectorFor(DummyAuthComponent).get(ActivatedRoute).params
      )
    );
  });

  it('creates a selector for a specific route param', async () => {
    const { harness, injectorFor } = await setup();

    await harness.router.navigateByUrl(
      '~/ndcZUxDDsyjY?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(
        injectorFor(DummyAuthComponent)
          .get(RouterStore)
          .selectRouteParam('token')
      )
    ).resolves.toBe('ndcZUxDDsyjY');
  });

  it('exposes a selector for route data', async () => {
    const { harness, injectorFor } = await setup({
      data: {
        testData: 'test-data',
      },
    });

    await harness.router.navigateByUrl(
      '~/wRWxnzmPTwPn?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(
        injectorFor(DummyAuthComponent).get(RouterStore).routeData$
      )
    ).resolves.toEqual({
      testData: 'test-data',
    });
  });

  it(`exposes a selector for route data matchin ${ActivatedRoute.name}#data`, async () => {
    const { harness, injectorFor } = await setup({
      data: {
        testData: 'test-data',
      },
    });

    await harness.router.navigateByUrl(
      '~/wRWxnzmPTwPn?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(
        injectorFor(DummyAuthComponent).get(RouterStore).routeData$
      )
    ).resolves.toEqual(
      await firstValueFrom(
        injectorFor(DummyAuthComponent).get(ActivatedRoute).data
      )
    );
  });

  it('creates a selector for specific route data', async () => {
    const { harness, injectorFor } = await setup({
      data: {
        testData: 'test-data',
      },
    });

    await harness.router.navigateByUrl(
      '~/ujZQmfrvXpkE?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(
        injectorFor(DummyAuthComponent)
          .get(RouterStore)
          .selectRouteData('testData')
      )
    ).resolves.toBe('test-data');
  });

  it('exposes a selector for the URL', async () => {
    const { harness, injectorFor } = await setup();

    await harness.router.navigateByUrl(
      '~/AQtsDDkyBnMv?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(injectorFor(DummyAuthComponent).get(RouterStore).url$)
    ).resolves.toBe('/auth/AQtsDDkyBnMv?ref=ngworker.github.io#test-fragment');
  });

  it('exposes a selector for the route title that emits static route titles', async () => {
    const { harness, injectorFor } = await setup({
      title: 'Static title',
    });
    const whenTitle = firstValueFrom(
      injectorFor(DummyAuthComponent).get(RouterStore).title$
    );

    await harness.router.navigateByUrl(
      '~/mZkqKzTpJpga?ref=ngworker.github.io#test-fragment'
    );

    await expect(whenTitle).resolves.toBe('Static title');
  });

  it('exposes a selector for the route title that emits resolved route titles', async () => {
    const { harness, injectorFor } = await setup({
      data: {
        testData: 'test-data',
      },
      title: (route) => route.data['testData'],
    });
    const whenTitle = firstValueFrom(
      injectorFor(DummyAuthComponent).get(RouterStore).title$
    );

    await harness.router.navigateByUrl(
      '~/HwVztCWzjCBv?ref=ngworker.github.io#test-fragment'
    );

    await expect(whenTitle).resolves.toBe('test-data');
  });

  it('exposes a selector for specific router events', async () => {
    const { harness, injectorFor } = await setup();
    const expectedUrl =
      '/auth/wWFtMMsJwvhK?ref=ngworker.github.io#test-fragment';
    const navigation$ = injectorFor(DummyAuthComponent)
      .get(RouterStore)
      .selectRouterEvents(NavigationStart, NavigationEnd);
    const whenNavigation = firstValueFrom(navigation$.pipe(take(2), toArray()));

    await harness.router.navigateByUrl(expectedUrl);

    await expect(whenNavigation).resolves.toEqual([
      new NavigationStart(3, expectedUrl),
      new NavigationEnd(3, expectedUrl, expectedUrl),
    ]);
  });
});
