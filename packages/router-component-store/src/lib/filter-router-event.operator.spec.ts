import { TestBed } from '@angular/core/testing';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RoutesRecognized,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { firstValueFrom, skip } from 'rxjs';
import { filterRouterEvents } from './filter-router-event.operator';

describe(filterRouterEvents.name, () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
    });

    const router = TestBed.inject(Router);

    return {
      router,
    };
  }

  it('filters one router event type', async () => {
    expect.assertions(1);
    const { router } = setup();
    const navigationStart$ = router.events.pipe(
      filterRouterEvents(NavigationStart)
    );
    const whenNavigationStart = firstValueFrom(navigationStart$);

    router.initialNavigation();

    await expect(whenNavigationStart).resolves.toBeInstanceOf(NavigationStart);
  });

  it('filters two router event types', async () => {
    expect.assertions(2);
    const { router } = setup();
    const navigation$ = router.events.pipe(
      filterRouterEvents(NavigationEnd, NavigationStart)
    );
    const whenNavigationStart = firstValueFrom(navigation$);
    const whenNavigationEnd = firstValueFrom(navigation$.pipe(skip(1)));

    router.initialNavigation();

    await expect(whenNavigationStart).resolves.toBeInstanceOf(NavigationStart);
    await expect(whenNavigationEnd).resolves.toBeInstanceOf(NavigationEnd);
  });

  it('filters three router event types', async () => {
    expect.assertions(3);
    const { router } = setup();
    const navigation$ = router.events.pipe(
      filterRouterEvents(NavigationEnd, NavigationStart, RoutesRecognized)
    );
    const whenNavigationStart = firstValueFrom(navigation$);
    const whenRoutesRecognized = firstValueFrom(navigation$.pipe(skip(1)));
    const whenNavigationEnd = firstValueFrom(navigation$.pipe(skip(2)));

    router.initialNavigation();

    await expect(whenNavigationStart).resolves.toBeInstanceOf(NavigationStart);
    await expect(whenRoutesRecognized).resolves.toBeInstanceOf(
      RoutesRecognized
    );
    await expect(whenNavigationEnd).resolves.toBeInstanceOf(NavigationEnd);
  });
});
