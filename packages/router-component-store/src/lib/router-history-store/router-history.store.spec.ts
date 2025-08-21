import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject, NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { firstValueFrom } from 'rxjs';
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
      [href]="previousUrl"
      (click)="onBack($event)"
      >&lt; Back</a
    >

    <a
      id="forward-link"
      *ngIf="routerHistory.nextUrl$ | async as nextUrl"
      [href]="nextUrl"
      (click)="onNext($event)"
      >&gt; Next</a
    >

    <a id="home-link" routerLink="/">Home</a>
    <a id="about-link" routerLink="about">About</a>
    <a id="company-link" routerLink="company">Company</a>
    <a id="products-link" routerLink="products">Products</a>

    <router-outlet></router-outlet>
  `,
})
class TestAppComponent {
  protected routerHistory = inject(RouterHistoryStore);

  onBack(event: MouseEvent) {
    event.preventDefault();
    this.routerHistory.onNavigateBack();
  }

  onNext(event: MouseEvent) {
    event.preventDefault();
    this.routerHistory.onNavigateForward();
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

  it('the URLs behave like the History API when navigating using links', async () => {
    expect.assertions(3);

    const { click, routerHistory } = await setup();

    // At Home
    // Previous: None
    // Next: None
    await click('#about-link');
    // At About
    // Previous: Home
    // Next: None
    await click('#company-link');
    // At Company
    // Previous: About
    // Next: None
    await click('#products-link');
    // At Products
    // Previous: Company
    // Next: None

    expect(await firstValueFrom(routerHistory.currentUrl$)).toBe('/products');
    expect(await firstValueFrom(routerHistory.previousUrl$)).toBe('/company');
    expect(await firstValueFrom(routerHistory.nextUrl$)).toBe(undefined);
  });

  it('the URLs behave like the History API when navigating back', async () => {
    expect.assertions(3);

    const { click, routerHistory } = await setup();

    // At Home
    // Previous: None
    // Next: None
    await click('#about-link');
    // At About
    // Previous: Home
    // Next: None
    await click('#company-link');
    // At Company
    // Previous: About
    // Next: None
    await click('#back-link');
    // At About
    // Previous: Home
    // Next: Company

    expect(await firstValueFrom(routerHistory.currentUrl$)).toBe('/about');
    expect(await firstValueFrom(routerHistory.previousUrl$)).toBe('/home');
    expect(await firstValueFrom(routerHistory.nextUrl$)).toBe('/company');
  });

  it('the URLs behave like the History API when navigating back twice', async () => {
    expect.assertions(3);

    const { click, routerHistory } = await setup();

    // At Home
    // Previous: None
    // Next: None
    await click('#about-link');
    // At About
    // Previous: Home
    // Next: None
    await click('#company-link');
    // At Company
    // Previous: About
    // Next: None
    await click('#back-link');
    // At About
    // Previous: Home
    // Next: Company
    await click('#back-link');
    // At Home
    // Previous: None
    // Next: About

    expect(await firstValueFrom(routerHistory.currentUrl$)).toBe('/home');
    expect(await firstValueFrom(routerHistory.previousUrl$)).toBe(undefined);
    expect(await firstValueFrom(routerHistory.nextUrl$)).toBe('/about');
  });

  it('the URLs behave like the History API when navigating back twice then forward', async () => {
    expect.assertions(3);

    const { click, routerHistory } = await setup();

    // At Home
    // Previous: None
    // Next: None
    await click('#about-link');
    // At About
    // Previous: Home
    // Next: None
    await click('#company-link');
    // At Company
    // Previous: About
    // Next: None
    await click('#back-link');
    // At About
    // Previous: Home
    // Next: Company
    await click('#back-link');
    // At Home
    // Previous: None
    // Next: About
    await click('#forward-link');
    // At About
    // Previous: Home
    // Next: Company

    expect(await firstValueFrom(routerHistory.currentUrl$)).toBe('/about');
    expect(await firstValueFrom(routerHistory.previousUrl$)).toBe('/home');
    expect(await firstValueFrom(routerHistory.nextUrl$)).toBe('/company');
  });

  it('the URLs behave like the History API when navigating back then using links', async () => {
    expect.assertions(3);

    const { click, routerHistory } = await setup();

    // At Home
    // Previous: None
    // Next: None
    await click('#about-link');
    // At About
    // Previous: Home
    // Next: None
    await click('#company-link');
    // At Company
    // Previous: About
    // Next: None
    await click('#back-link');
    // At About
    // Previous: Home
    // Next: Company
    await click('#products-link');
    // At Products
    // Previous: About
    // Next: None

    expect(await firstValueFrom(routerHistory.currentUrl$)).toBe('/products');
    expect(await firstValueFrom(routerHistory.previousUrl$)).toBe('/about');
    expect(await firstValueFrom(routerHistory.nextUrl$)).toBe(undefined);
  });

  it('the URLs behave like the History API when navigating back then forward', async () => {
    expect.assertions(3);

    const { click, routerHistory } = await setup();

    // At Home
    await click('#about-link');
    // At About
    // Previous: Home
    // Next: None
    await click('#company-link');
    // At Company
    // Previous: About
    // Next: None
    await click('#back-link');
    // At About
    // Previous: Home
    // Next: Company
    await click('#forward-link');
    // At Company
    // Previous: About
    // Next: None

    expect(await firstValueFrom(routerHistory.currentUrl$)).toBe('/company');
    expect(await firstValueFrom(routerHistory.previousUrl$)).toBe('/about');
    expect(await firstValueFrom(routerHistory.nextUrl$)).toBe(undefined);
  });
});
