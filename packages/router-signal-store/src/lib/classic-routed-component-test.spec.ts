import { Component, inject, NgModule, Signal } from '@angular/core';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideGlobalRouterSignalStore } from './global-router-signal-store/provide-global-router-signal-store';
import { provideLocalRouterSignalStore } from './local-router-signal-store/provide-local-router-signal-store';
import { RouterSignalStore } from './router-signal-store';

async function setup({
  initialUrl,
  routerStore,
}: {
  readonly initialUrl: string;
  readonly routerStore: 'global' | 'local';
}) {
  TestBed.configureTestingModule({
    imports: [
      ClassicAppScam,
      ClassicDefaultScam,
      ClassicRoutedScam,
      RouterTestingModule.withRoutes([
        {
          path: '',
          pathMatch: 'full',
          component: ClassicDefaultComponent,
        },
        {
          path: 'entities/:id',
          component: ClassicRoutedComponent,
        },
      ]),
    ],
    providers: [
      {
        provide: ComponentFixtureAutoDetect,
        useValue: true,
      },
      routerStore === 'global' ? provideGlobalRouterSignalStore() : [],
    ],
  });

  if (routerStore === 'local') {
    TestBed.overrideComponent(ClassicRoutedComponent, {
      add: {
        providers: [provideLocalRouterSignalStore()],
      },
    });
  }

  const rootFixture = TestBed.createComponent(ClassicAppComponent);
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
  selector: 'ngw-classic-routed',
  template: `
    <p id="id-parameter">{{ id() }}</p>
    <p id="url">{{ url() }}</p>
  `,
})
class ClassicRoutedComponent {
  #routerSignalStore = inject(RouterSignalStore);

  id: Signal<string | undefined> =
    this.#routerSignalStore.selectRouteParam('id');
  url: Signal<string> = this.#routerSignalStore.url;
}

@NgModule({
  declarations: [ClassicRoutedComponent],
  imports: [],
})
class ClassicRoutedScam {}

@Component({
  selector: 'ngw-classic-default',
  template: `<h1>Default route</h1>`,
})
class ClassicDefaultComponent {}

@NgModule({
  declarations: [ClassicDefaultComponent],
})
class ClassicDefaultScam {}

@Component({
  selector: 'ngw-classic-app',
  template: `<router-outlet></router-outlet>`,
})
class ClassicAppComponent {}

@NgModule({
  declarations: [ClassicAppComponent],
  imports: [RouterModule],
})
class ClassicAppScam {}

describe('Classic routed component test', () => {
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
