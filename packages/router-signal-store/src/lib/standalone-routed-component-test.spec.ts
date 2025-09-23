import { Component, Signal, inject } from '@angular/core';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, RouterOutlet } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideGlobalRouterSignalStore } from './global-router-signal-store/provide-global-router-signal-store';
import { provideLocalRouterSignalStore } from './local-router-signal-store/provide-local-router-signal-store';
import { RouterSignalStore } from './router-signal-store';

async function setup({
  initialUrl,
  routerSignalStore,
}: {
  readonly initialUrl: string;
  readonly routerSignalStore: 'global' | 'local';
}) {
  TestBed.configureTestingModule({
    imports: [
      RouterTestingModule.withRoutes([
        {
          path: '',
          pathMatch: 'full',
          component: StandaloneDefaultComponent,
        },
        {
          path: 'entities/:id',
          component: StandaloneRoutedComponent,
        },
      ]),
    ],
    providers: [
      {
        provide: ComponentFixtureAutoDetect,
        useValue: true,
      },
      routerSignalStore === 'global' ? provideGlobalRouterSignalStore() : [],
    ],
  });

  if (routerSignalStore === 'local') {
    TestBed.overrideComponent(StandaloneRoutedComponent, {
      add: {
        providers: [provideLocalRouterSignalStore()],
      },
    });
  }

  const rootFixture = TestBed.createComponent(StandaloneAppComponent);
  const router = TestBed.inject(Router);
  router.initialNavigation();

  const navigationSuccess = await rootFixture.ngZone?.run(() =>
    router.navigateByUrl(initialUrl)
  );

  if (!navigationSuccess) {
    throw new Error('Navigation failed');
  }

  return {
    getDisplayedId(): string {
      const element: HTMLElement = rootFixture.debugElement.query(
        By.css('#id-parameter')
      ).nativeElement;

      return element.textContent ?? '';
    },
    getDisplayedUrl(): string {
      const element: HTMLElement = rootFixture.debugElement.query(
        By.css('#url')
      ).nativeElement;

      return element.textContent ?? '';
    },
  };
}

@Component({
  standalone: true,
  selector: 'ngw-standalone-routed',
  imports: [],
  template: `
    <p id="id-parameter">{{ id() }}</p>
    <p id="url">{{ url() }}</p>
  `,
})
class StandaloneRoutedComponent {
  #routerSignalStore = inject(RouterSignalStore);

  id: Signal<string | undefined> =
    this.#routerSignalStore.selectRouteParam('id');
  url: Signal<string> = this.#routerSignalStore.url;
}

@Component({
  standalone: true,
  selector: 'ngw-standalone-default',
  template: `<h1>Default route</h1>`,
})
class StandaloneDefaultComponent {}

@Component({
  standalone: true,
  selector: 'ngw-standalone-app',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
class StandaloneAppComponent {}

describe('Standalone routed component test', () => {
  it('with global router store', async () => {
    const entityId = 1234;
    const { getDisplayedId, getDisplayedUrl } = await setup({
      initialUrl: `/entities/${entityId}`,
      routerSignalStore: 'global',
    });

    expect(getDisplayedId()).toBe(entityId.toString());
    expect(getDisplayedUrl()).toBe(`/entities/${entityId}`);
  });

  it('with local router store', async () => {
    const entityId = 5678;
    const { getDisplayedId, getDisplayedUrl } = await setup({
      initialUrl: `/entities/${entityId}`,
      routerSignalStore: 'local',
    });

    expect(getDisplayedId()).toBe(entityId.toString());
    expect(getDisplayedUrl()).toBe(`/entities/${entityId}`);
  });
});
