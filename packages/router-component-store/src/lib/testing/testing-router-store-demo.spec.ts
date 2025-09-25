import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { RouterStore } from '../router-store';
import { provideTestingRouterStore, TestingRouterStore } from '../testing';

// Example component that uses RouterStore
@Component({
  standalone: true,
  imports: [AsyncPipe, NgIf],
  selector: 'ngw-demo-hero-detail',
  template: `
    <h1 [textContent]="title$ | async"></h1>
    <div class="hero-info">
      <p class="hero-id">Hero ID: <span [textContent]="heroId$ | async"></span></p>
      <p class="search">Search: <span [textContent]="searchQuery$ | async"></span></p>
      <p class="url">URL: <span [textContent]="url$ | async"></span></p>
      <p class="allow-edit">Allow Edit: <span [textContent]="(allowEdit$ | async) ? 'Yes' : 'No'"></span></p>
    </div>
    <div class="breadcrumbs" *ngIf="breadcrumbs$ | async as breadcrumbs">
      Breadcrumbs: {{ breadcrumbs.join(' > ') }}
    </div>
  `,
})
class DemoHeroDetailComponent {
  private routerStore = inject(RouterStore);

  title$ = this.routerStore.title$;
  heroId$ = this.routerStore.selectRouteParam('id');
  searchQuery$ = this.routerStore.selectQueryParam('search');
  url$ = this.routerStore.url$;
  allowEdit$ = this.routerStore.selectRouteDataParam('allowEdit');
  breadcrumbs$ = this.routerStore.selectRouteDataParam('breadcrumbs');
}

// Example service that uses RouterStore
class DemoHeroService {
  private routerStore = inject(RouterStore);

  currentHeroId$ = this.routerStore.selectRouteParam('id');
  isEditMode$ = this.routerStore.selectQueryParam('edit');

  async getCurrentHeroId(): Promise<string | undefined> {
    return firstValueFrom(this.currentHeroId$);
  }
}

describe('TestingRouterStore Demo', () => {
  describe('Component Integration', () => {
    let routerStore: TestingRouterStore;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [DemoHeroDetailComponent],
        providers: [provideTestingRouterStore()],
      });

      routerStore = TestBed.inject(RouterStore) as TestingRouterStore;
    });

    it('should demonstrate complete router state control', async () => {
      const fixture = TestBed.createComponent(DemoHeroDetailComponent);

      // Set up a complex router state
      routerStore.setUrl('/heroes/123?search=batman&edit=true#details');
      routerStore.setTitle('Batman Details');
      routerStore.setRouteParam('id', '123');
      routerStore.setQueryParams({ search: 'batman', edit: 'true' });
      routerStore.setRouteData({
        allowEdit: true,
        breadcrumbs: ['Home', 'Heroes', 'Batman'],
      });

      fixture.detectChanges();
      await fixture.whenStable();

      const compiled = fixture.nativeElement;

      // Verify the component displays all the router state correctly
      expect(compiled.querySelector('h1')?.textContent?.trim()).toBe('Batman Details');
      expect(compiled.querySelector('.hero-id span')?.textContent?.trim()).toBe('123');
      expect(compiled.querySelector('.search span')?.textContent?.trim()).toBe('batman');
      expect(compiled.querySelector('.url span')?.textContent?.trim()).toBe('/heroes/123?search=batman&edit=true#details');
      expect(compiled.querySelector('.allow-edit span')?.textContent?.trim()).toBe('Yes');
      expect(compiled.textContent).toContain('Breadcrumbs: Home > Heroes > Batman');
    });

    it('should handle state changes dynamically', async () => {
      const fixture = TestBed.createComponent(DemoHeroDetailComponent);

      // Start with default state
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.hero-id span')?.textContent).toBeFalsy();

      // Update hero ID
      routerStore.setRouteParam('id', '456');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.hero-id span')?.textContent?.trim()).toBe('456');

      // Reset and verify defaults are restored
      routerStore.reset();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.hero-id span')?.textContent).toBeFalsy();
    });
  });

  describe('Service Integration', () => {
    let service: DemoHeroService;
    let routerStore: TestingRouterStore;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [DemoHeroService, provideTestingRouterStore()],
      });

      service = TestBed.inject(DemoHeroService);
      routerStore = TestBed.inject(RouterStore) as TestingRouterStore;
    });

    it('should work with services that depend on RouterStore', async () => {
      // Initially no hero ID
      expect(await service.getCurrentHeroId()).toBeUndefined();

      // Set hero ID and verify service picks it up
      routerStore.setRouteParam('id', '789');
      expect(await service.getCurrentHeroId()).toBe('789');
    });

    it('should handle observable streams', (done) => {
      let emissionCount = 0;
      const expectedValues = [undefined, 'first', 'second'];

      service.currentHeroId$.subscribe(id => {
        expect(id).toBe(expectedValues[emissionCount]);
        emissionCount++;
        
        if (emissionCount === 3) {
          done();
        }
      });

      // Trigger emissions
      routerStore.setRouteParam('id', 'first');
      routerStore.setRouteParam('id', 'second');
    });
  });

  describe('Complex Scenarios', () => {
    let routerStore: TestingRouterStore;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideTestingRouterStore()],
      });

      routerStore = TestBed.inject(RouterStore) as TestingRouterStore;
    });

    it('should handle array query parameters', async () => {
      routerStore.setQueryParam('tags', ['action', 'superhero', 'dc']);
      
      const tags = await firstValueFrom(routerStore.selectQueryParam('tags'));
      expect(tags).toEqual(['action', 'superhero', 'dc']);
    });

    it('should handle complex route data', async () => {
      const complexData = {
        permissions: ['read', 'write'],
        metadata: { version: '1.0', author: 'test' },
        settings: { theme: 'dark', language: 'en' },
      };

      routerStore.setRouteDataParam('config', complexData);
      
      const config = await firstValueFrom(routerStore.selectRouteDataParam('config'));
      expect(config).toEqual(complexData);
    });

    it('should preserve independent parameter updates', async () => {
      // Set initial state
      routerStore.setRouteParams({ id: '1', type: 'hero' });
      routerStore.setQueryParams({ search: 'batman', page: '1' });

      // Update individual parameters
      routerStore.setRouteParam('id', '2');
      routerStore.setQueryParam('search', 'superman');

      // Verify other parameters are preserved
      const routeParams = await firstValueFrom(routerStore.routeParams$);
      const queryParams = await firstValueFrom(routerStore.queryParams$);

      expect(routeParams).toEqual({ id: '2', type: 'hero' });
      expect(queryParams).toEqual({ search: 'superman', page: '1' });
    });
  });
});