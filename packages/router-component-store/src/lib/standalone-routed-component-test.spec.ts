import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, RouterOutlet } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { provideGlobalRouterStore } from './global-router-store/provide-global-router-store';
import { provideLocalRouterStore } from './local-router-store/provide-local-router-store';
import { RouterStore } from './router-store';

async function setup({
  initialUrl,
  routerStore,
}: {
  readonly initialUrl: string;
  readonly routerStore: 'global' | 'local';
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
      routerStore === 'global' ? provideGlobalRouterStore() : [],
    ],
  });

  if (routerStore === 'local') {
    TestBed.overrideComponent(StandaloneRoutedComponent, {
      add: {
        providers: [provideLocalRouterStore()],
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
  imports: [AsyncPipe],
  template: `
    <p id="id-parameter">{{ id$ | async }}</p>
    <p id="url">{{ url$ | async }}</p>
  `,
})
class StandaloneRoutedComponent {
  #routerStore = inject(RouterStore);

  id$: Observable<string | undefined> =
    this.#routerStore.selectRouteParam('id');
  url$: Observable<string> = this.#routerStore.url$;
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
      routerStore: 'global',
    });

    expect(getDisplayedId()).toBe(entityId.toString());
    expect(getDisplayedUrl()).toBe(`/entities/${entityId}`);
  });

  it('with local router store', async () => {
    const entityId = 5678;
    const { getDisplayedId, getDisplayedUrl } = await setup({
      initialUrl: `/entities/${entityId}`,
      routerStore: 'local',
    });

    expect(getDisplayedId()).toBe(entityId.toString());
    expect(getDisplayedUrl()).toBe(`/entities/${entityId}`);
  });
});
