import { AsyncPipe, Location, NgIf } from '@angular/common';
import { Component, inject, NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  provideRouterHistoryStore,
  RouterHistoryStore,
} from './router-history.store';

function createTestComponent(name: string, selector: string) {
  @Component({ standalone: true, selector, template: name })
  class TestComponent {}

  return TestComponent;
}

@Component({
  standalone: true,
  selector: 'ngw-test-app',
  imports: [AsyncPipe, NgIf, RouterLink, RouterOutlet],
  template: `
    <a
      id="back-link"
      *ngIf="routerHistory.previousUrl$ | async as previousUrl"
      (click)="onBack()"
      >Back</a
    >

    <a id="home-link" routerLink="/">Home</a>
    <a id="about-link" routerLink="about">About</a>
    <a id="company-link" routerLink="company">Company</a>
    <a id="products-link" routerLink="products">Products</a>

    <router-outlet></router-outlet>
  `,
})
class TestAppComponent {
  #location = inject(Location);

  protected routerHistory = inject(RouterHistoryStore);

  onBack() {
    this.#location.back();
  }
}

describe(RouterHistoryStore.name, () => {
  async function setup() {
    TestBed.configureTestingModule({
      imports: [
        TestAppComponent,
        RouterTestingModule.withRoutes([
          { path: '', pathMatch: 'full', redirectTo: 'home' },
          {
            path: 'home',
            component: createTestComponent('HomeComponent', 'test-home'),
          },
          {
            path: 'about',
            component: createTestComponent('AboutComponent', 'test-about'),
          },
          {
            path: 'company',
            component: createTestComponent('CompanyComponent', 'test-company'),
          },
          {
            path: 'products',
            component: createTestComponent(
              'ProductsComponent',
              'test-products'
            ),
          },
        ]),
      ],
      providers: [provideRouterHistoryStore()],
    });

    const rootFixture = TestBed.createComponent(TestAppComponent);
    const router = TestBed.inject(Router);
    const ngZone = TestBed.inject(NgZone);
    const routerHistory = TestBed.inject(RouterHistoryStore);

    rootFixture.autoDetectChanges();
    ngZone.run(() => router.initialNavigation());

    return {
      async click(selector: string) {
        const link = rootFixture.debugElement.query(By.css(selector))
          .nativeElement as HTMLElement;
        ngZone.run(() => link.click());
        await rootFixture.whenStable();
      },
      routerHistory,
    };
  }

  it('the URLs behave like the History API when navigating back', async () => {
    const { click, routerHistory } = await setup();
    let currentUrl: string | undefined;
    routerHistory.currentUrl$.subscribe((url) => {
      currentUrl = url;
    });
    let previousUrl: string | null | undefined;
    routerHistory.previousUrl$.subscribe((url) => {
      previousUrl = url;
    });

    // At Home
    await click('#about-link');
    // At About
    await click('#company-link');
    // At Company
    await click('#back-link');
    // At About

    expect(currentUrl).toBe('/about');
    expect(previousUrl).toBe('/home');
  });
});
