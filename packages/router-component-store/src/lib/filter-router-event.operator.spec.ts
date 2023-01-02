import { Component, NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RoutesRecognized,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { firstValueFrom, take, toArray } from 'rxjs';
import { filterRouterEvents } from './filter-router-event.operator';

@Component({
  standalone: true,
  template: '',
})
class DummyTestComponent {}

const navigationEnd = new NavigationEnd(1, '/', '/');
const navigationStart = new NavigationStart(1, '/');
const routesRecognized = new RoutesRecognized(
  1,
  '/',
  '/',
  expect.objectContaining({
    url: '/',
  })
);

describe(filterRouterEvents.name, () => {
  function setup({
    assertions = 1,
  }: {
    readonly assertions?: number;
  } = {}) {
    expect.assertions(assertions);

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          {
            path: 'test',
            component: DummyTestComponent,
          },
        ]),
      ],
    });

    const ngZone = TestBed.inject(NgZone);
    const router = TestBed.inject(Router);
    const routerEvents = router.events;

    return {
      navigateByUrl(url: string) {
        return ngZone.run(() => router.navigateByUrl(url));
      },
      routerEvents,
    };
  }

  it('filters 1 router event type', async () => {
    const { navigateByUrl, routerEvents } = setup();
    const navigationStart$ = routerEvents.pipe(
      filterRouterEvents(NavigationStart)
    );
    const whenNavigationStart = firstValueFrom(navigationStart$);

    await navigateByUrl('/');

    await expect(whenNavigationStart).resolves.toEqual(navigationStart);
  });

  it('filters 2 router event types', async () => {
    const { navigateByUrl, routerEvents } = setup();
    const navigation$ = routerEvents.pipe(
      filterRouterEvents(NavigationEnd, NavigationStart)
    );
    const whenNavigation = firstValueFrom(navigation$.pipe(take(2), toArray()));

    await navigateByUrl('/');

    await expect(whenNavigation).resolves.toEqual([
      navigationStart,
      navigationEnd,
    ]);
  });

  it('filters 3 router event types', async () => {
    const { navigateByUrl, routerEvents } = setup();
    const navigation$ = routerEvents.pipe(
      filterRouterEvents(NavigationEnd, NavigationStart, RoutesRecognized)
    );
    const whenNavigation = firstValueFrom(navigation$.pipe(take(3), toArray()));

    await navigateByUrl('/');

    await expect(whenNavigation).resolves.toEqual([
      navigationStart,
      routesRecognized,
      navigationEnd,
    ]);
  });

  it('filters multiple events of 1 router event type', async () => {
    const { navigateByUrl, routerEvents } = setup();
    const navigationStart$ = routerEvents.pipe(
      filterRouterEvents(NavigationStart)
    );
    const whenNavigationStart = firstValueFrom(
      navigationStart$.pipe(take(2), toArray())
    );

    await navigateByUrl('/');
    await navigateByUrl('/test');

    await expect(whenNavigationStart).resolves.toEqual([
      navigationStart,
      new NavigationStart(2, '/test'),
    ]);
  });

  it('filters multiple events of 2 router event types', async () => {
    const { navigateByUrl, routerEvents } = setup();
    const navigation$ = routerEvents.pipe(
      filterRouterEvents(NavigationEnd, NavigationStart)
    );
    const whenNavigation = firstValueFrom(navigation$.pipe(take(4), toArray()));

    await navigateByUrl('/');
    await navigateByUrl('/test');

    await expect(whenNavigation).resolves.toEqual([
      navigationStart,
      navigationEnd,
      new NavigationStart(2, '/test'),
      new NavigationEnd(2, '/test', '/test'),
    ]);
  });

  it('filters multiple events of 3 router event types', async () => {
    const { navigateByUrl, routerEvents } = setup();
    const navigation$ = routerEvents.pipe(
      filterRouterEvents(NavigationEnd, NavigationStart, RoutesRecognized)
    );
    const whenNavigation = firstValueFrom(navigation$.pipe(take(6), toArray()));

    await navigateByUrl('/');
    await navigateByUrl('/test');

    await expect(whenNavigation).resolves.toEqual([
      navigationStart,
      routesRecognized,
      navigationEnd,
      new NavigationStart(2, '/test'),
      new RoutesRecognized(
        2,
        '/test',
        '/test',
        expect.objectContaining({ url: '/test' })
      ),
      new NavigationEnd(2, '/test', '/test'),
    ]);
  });
});
