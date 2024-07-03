import { Component, inject, NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
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
import { LocalRouterStore } from './local-router-store';
import { provideLocalRouterStore } from './provide-local-router-store';

@Component({
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
class DummyAppComponent {}

@Component({
  standalone: true,
  viewProviders: [provideLocalRouterStore()],
  template: '',
})
class DummyAuthComponent {
  activatedRoute = inject(ActivatedRoute);
  routerStore = inject(RouterStore);
}

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
    });

    const rootFixture = TestBed.createComponent(DummyAppComponent);
    rootFixture.autoDetectChanges(true);

    const ngZone = TestBed.inject(NgZone);
    const router = TestBed.inject(Router);

    await navigateByUrl(
      '/auth/jnBGhzQEWtYv?ref=ngworker.github.io#test-fragment'
    );

    return {
      get activatedRoute(): ActivatedRoute {
        return (
          rootFixture.debugElement.query(By.directive(DummyAuthComponent))
            .componentInstance as DummyAuthComponent
        ).activatedRoute;
      },
      navigateByUrl,
      get routerStore(): RouterStore {
        return (
          rootFixture.debugElement.query(By.directive(DummyAuthComponent))
            .componentInstance as DummyAuthComponent
        ).routerStore;
      },
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
      '/auth/TrmAXFHwmQwd?ref=ngworker.github.io#test-fragment'
    );

    await expect(firstValueFrom(routerStore.currentRoute$)).resolves.toEqual({
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
    const { navigateByUrl, routerStore } = await setup();

    await navigateByUrl(
      '/auth/VtwXNTjucDtY?ref=ngworker.github.io#test-fragment'
    );

    await expect(firstValueFrom(routerStore.fragment$)).resolves.toBe(
      'test-fragment'
    );
  });

  it(`exposts a selector for the fragment matching ${ActivatedRoute.name}#fragment`, async () => {
    const { activatedRoute, navigateByUrl, routerStore } = await setup();

    await navigateByUrl(
      '/auth/VtwXNTjucDtY?ref=ngworker.github.io#test-fragment'
    );

    await expect(firstValueFrom(routerStore.fragment$)).resolves.toBe(
      await firstValueFrom(activatedRoute.fragment)
    );
  });

  it('exposes a selector for query params', async () => {
    const { navigateByUrl, routerStore } = await setup();

    await navigateByUrl(
      '/auth/JPJUnbTUtruT?ref=ngworker.github.io#test-fragment'
    );

    await expect(firstValueFrom(routerStore.queryParams$)).resolves.toEqual({
      ref: 'ngworker.github.io',
    });
  });

  it(`exposes a selector for query params matching ${ActivatedRoute.name}#queryParams`, async () => {
    const { activatedRoute, navigateByUrl, routerStore } = await setup();

    await navigateByUrl(
      '/auth/JPJUnbTUtruT?ref=ngworker.github.io#test-fragment'
    );

    await expect(firstValueFrom(routerStore.queryParams$)).resolves.toEqual(
      await firstValueFrom(activatedRoute.queryParams)
    );
  });

  it('creates a selector for a specific query param', async () => {
    const { navigateByUrl, routerStore } = await setup();

    await navigateByUrl(
      '/auth/ccrfBcnKrfDW?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(routerStore.selectQueryParam('ref'))
    ).resolves.toBe('ngworker.github.io');
  });

  it('exposes a selector for route params', async () => {
    const { navigateByUrl, routerStore } = await setup();

    await navigateByUrl(
      '/auth/vpXxPMkvtTGw?ref=ngworker.github.io#test-fragment'
    );

    await expect(firstValueFrom(routerStore.routeParams$)).resolves.toEqual({
      token: 'vpXxPMkvtTGw',
    });
  });

  it(`exposes a selector for route params matching ${ActivatedRoute.name}#params`, async () => {
    const { activatedRoute, navigateByUrl, routerStore } = await setup();

    await navigateByUrl(
      '/auth/vpXxPMkvtTGw?ref=ngworker.github.io#test-fragment'
    );

    await expect(firstValueFrom(routerStore.routeParams$)).resolves.toEqual(
      await firstValueFrom(activatedRoute.params)
    );
  });

  it('creates a selector for a specific route param', async () => {
    const { navigateByUrl, routerStore } = await setup();

    await navigateByUrl(
      '/auth/ndcZUxDDsyjY?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(routerStore.selectRouteParam('token'))
    ).resolves.toBe('ndcZUxDDsyjY');
  });

  it('exposes a selector for route data', async () => {
    const { navigateByUrl, routerStore } = await setup({
      data: {
        testData: 'test-data',
      },
    });

    await navigateByUrl(
      '/auth/wRWxnzmPTwPn?ref=ngworker.github.io#test-fragment'
    );

    await expect(firstValueFrom(routerStore.routeData$)).resolves.toEqual({
      testData: 'test-data',
    });
  });

  it(`exposes a selector for route data matchin ${ActivatedRoute.name}#data`, async () => {
    const { activatedRoute, navigateByUrl, routerStore } = await setup({
      data: {
        testData: 'test-data',
      },
    });

    await navigateByUrl(
      '/auth/wRWxnzmPTwPn?ref=ngworker.github.io#test-fragment'
    );

    await expect(firstValueFrom(routerStore.routeData$)).resolves.toEqual(
      await firstValueFrom(activatedRoute.data)
    );
  });

  it('creates a selector for specific route data', async () => {
    const { navigateByUrl, routerStore } = await setup({
      data: {
        testData: 'test-data',
      },
    });

    await navigateByUrl(
      '/auth/ujZQmfrvXpkE?ref=ngworker.github.io#test-fragment'
    );

    await expect(
      firstValueFrom(routerStore.selectRouteData<string>('testData'))
    ).resolves.toBe('test-data');
  });

  it('exposes a selector for the URL', async () => {
    const { navigateByUrl, routerStore } = await setup();

    await navigateByUrl(
      '/auth/AQtsDDkyBnMv?ref=ngworker.github.io#test-fragment'
    );

    await expect(firstValueFrom(routerStore.url$)).resolves.toBe(
      '/auth/AQtsDDkyBnMv?ref=ngworker.github.io#test-fragment'
    );
  });

  it('exposes a selector for the route title that emits static route titles', async () => {
    const { navigateByUrl, routerStore } = await setup({
      title: 'Static title',
    });
    const whenTitle = firstValueFrom(routerStore.title$);

    await navigateByUrl(
      '/auth/mZkqKzTpJpga?ref=ngworker.github.io#test-fragment'
    );

    await expect(whenTitle).resolves.toBe('Static title');
  });

  it('exposes a selector for the route title that emits resolved route titles', async () => {
    const { navigateByUrl, routerStore } = await setup({
      data: {
        testData: 'test-data',
      },
      title: (route) => route.data['testData'],
    });
    const whenTitle = firstValueFrom(routerStore.title$);

    await navigateByUrl(
      '/auth/HwVztCWzjCBv?ref=ngworker.github.io#test-fragment'
    );

    await expect(whenTitle).resolves.toBe('test-data');
  });

  it('exposes a selector for specific router events', async () => {
    const { navigateByUrl, routerStore } = await setup();
    const expectedUrl =
      '/auth/wWFtMMsJwvhK?ref=ngworker.github.io#test-fragment';
    const navigation$ = routerStore.selectRouterEvents(
      NavigationStart,
      NavigationEnd
    );
    const whenNavigation = firstValueFrom(navigation$.pipe(take(2), toArray()));

    await navigateByUrl(expectedUrl);

    await expect(whenNavigation).resolves.toEqual([
      new NavigationStart(2, expectedUrl),
      new NavigationEnd(2, expectedUrl, expectedUrl),
    ]);
  });
});
