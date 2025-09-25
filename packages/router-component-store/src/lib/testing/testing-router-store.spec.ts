import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UrlSegment } from '@angular/router';
import { firstValueFrom, take } from 'rxjs';
import { MinimalActivatedRouteSnapshot } from '../@ngrx/router-store/minimal-activated-route-state-snapshot';
import { RouterStore } from '../router-store';
import { provideTestingRouterStore } from './provide-testing-router-store';
import { injectTestingRouterStore, TestingRouterStore } from './testing-router-store';

@Component({
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div id="url">{{ url$ | async }}</div>
    <div id="fragment">{{ fragment$ | async }}</div>
    <div id="title">{{ title$ | async }}</div>
    <div id="route-param">{{ routeParam$ | async }}</div>
    <div id="query-param">{{ queryParam$ | async }}</div>
    <div id="route-data">{{ routeData$ | async }}</div>
  `,
})
class TestComponent {
  private routerStore = inject(RouterStore);
  url$ = this.routerStore.url$;
  fragment$ = this.routerStore.fragment$;
  title$ = this.routerStore.title$;
  routeParam$ = this.routerStore.selectRouteParam('id');
  queryParam$ = this.routerStore.selectQueryParam('search');
  routeData$ = this.routerStore.selectRouteDataParam('limit');
}

describe('TestingRouterStore', () => {
  let testingRouterStore: TestingRouterStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideTestingRouterStore()],
    });

    testingRouterStore = TestBed.inject(RouterStore) as TestingRouterStore;
  });

  it('should be provided by provideTestingRouterStore', () => {
    expect(testingRouterStore).toBeInstanceOf(TestingRouterStore);
  });

  describe('default values', () => {
    it('should have default currentRoute$', async () => {
      const currentRoute = await firstValueFrom(testingRouterStore.currentRoute$);
      
      expect(currentRoute).toEqual({
        routeConfig: null,
        url: [],
        params: {},
        queryParams: {},
        fragment: null,
        data: {},
        outlet: 'primary',
        title: undefined,
        firstChild: undefined,
        children: [],
      });
    });

    it('should have default fragment$ as null', async () => {
      const fragment = await firstValueFrom(testingRouterStore.fragment$);
      expect(fragment).toBeNull();
    });

    it('should have default queryParams$ as empty object', async () => {
      const queryParams = await firstValueFrom(testingRouterStore.queryParams$);
      expect(queryParams).toEqual({});
    });

    it('should have default routeData$ as empty object', async () => {
      const routeData = await firstValueFrom(testingRouterStore.routeData$);
      expect(routeData).toEqual({});
    });

    it('should have default routeParams$ as empty object', async () => {
      const routeParams = await firstValueFrom(testingRouterStore.routeParams$);
      expect(routeParams).toEqual({});
    });

    it('should have default title$ as undefined', async () => {
      const title = await firstValueFrom(testingRouterStore.title$);
      expect(title).toBeUndefined();
    });

    it('should have default url$ as "/"', async () => {
      const url = await firstValueFrom(testingRouterStore.url$);
      expect(url).toBe('/');
    });
  });

  describe('setUrl', () => {
    it('should update url$', async () => {
      testingRouterStore.setUrl('/heroes/123');
      const url = await firstValueFrom(testingRouterStore.url$);
      expect(url).toBe('/heroes/123');
    });
  });

  describe('setFragment', () => {
    it('should update fragment$', async () => {
      testingRouterStore.setFragment('section1');
      const fragment = await firstValueFrom(testingRouterStore.fragment$);
      expect(fragment).toBe('section1');
    });

    it('should allow setting fragment to null', async () => {
      testingRouterStore.setFragment('section1');
      testingRouterStore.setFragment(null);
      const fragment = await firstValueFrom(testingRouterStore.fragment$);
      expect(fragment).toBeNull();
    });
  });

  describe('setTitle', () => {
    it('should update title$', async () => {
      testingRouterStore.setTitle('Hero Details');
      const title = await firstValueFrom(testingRouterStore.title$);
      expect(title).toBe('Hero Details');
    });

    it('should allow setting title to undefined', async () => {
      testingRouterStore.setTitle('Hero Details');
      testingRouterStore.setTitle(undefined);
      const title = await firstValueFrom(testingRouterStore.title$);
      expect(title).toBeUndefined();
    });
  });

  describe('route parameters', () => {
    describe('setRouteParams', () => {
      it('should update routeParams$', async () => {
        testingRouterStore.setRouteParams({ id: '123', type: 'hero' });
        const routeParams = await firstValueFrom(testingRouterStore.routeParams$);
        expect(routeParams).toEqual({ id: '123', type: 'hero' });
      });
    });

    describe('setRouteParam', () => {
      it('should update individual route parameter', async () => {
        testingRouterStore.setRouteParam('id', '456');
        const routeParams = await firstValueFrom(testingRouterStore.routeParams$);
        expect(routeParams).toEqual({ id: '456' });
      });

      it('should preserve other route parameters when setting individual parameter', async () => {
        testingRouterStore.setRouteParams({ id: '123', type: 'hero' });
        testingRouterStore.setRouteParam('id', '456');
        const routeParams = await firstValueFrom(testingRouterStore.routeParams$);
        expect(routeParams).toEqual({ id: '456', type: 'hero' });
      });
    });

    describe('selectRouteParam', () => {
      it('should return undefined for non-existent parameter', async () => {
        const paramValue = await firstValueFrom(testingRouterStore.selectRouteParam('nonexistent'));
        expect(paramValue).toBeUndefined();
      });

      it('should return parameter value when it exists', async () => {
        testingRouterStore.setRouteParam('id', '789');
        const paramValue = await firstValueFrom(testingRouterStore.selectRouteParam('id'));
        expect(paramValue).toBe('789');
      });

      it('should emit new values when parameter changes', (done) => {
        const values: (string | undefined)[] = [];
        
        testingRouterStore.selectRouteParam('id').pipe(take(3)).subscribe({
          next: (value) => values.push(value),
          complete: () => {
            expect(values).toEqual([undefined, '123', '456']);
            done();
          },
        });

        testingRouterStore.setRouteParam('id', '123');
        testingRouterStore.setRouteParam('id', '456');
      });
    });
  });

  describe('query parameters', () => {
    describe('setQueryParams', () => {
      it('should update queryParams$', async () => {
        testingRouterStore.setQueryParams({ search: 'hero', page: '1' });
        const queryParams = await firstValueFrom(testingRouterStore.queryParams$);
        expect(queryParams).toEqual({ search: 'hero', page: '1' });
      });
    });

    describe('setQueryParam', () => {
      it('should update individual query parameter', async () => {
        testingRouterStore.setQueryParam('search', 'villain');
        const queryParams = await firstValueFrom(testingRouterStore.queryParams$);
        expect(queryParams).toEqual({ search: 'villain' });
      });

      it('should preserve other query parameters when setting individual parameter', async () => {
        testingRouterStore.setQueryParams({ search: 'hero', page: '1' });
        testingRouterStore.setQueryParam('search', 'villain');
        const queryParams = await firstValueFrom(testingRouterStore.queryParams$);
        expect(queryParams).toEqual({ search: 'villain', page: '1' });
      });

      it('should support array values', async () => {
        testingRouterStore.setQueryParam('tags', ['action', 'adventure']);
        const queryParams = await firstValueFrom(testingRouterStore.queryParams$);
        expect(queryParams).toEqual({ tags: ['action', 'adventure'] });
      });
    });

    describe('selectQueryParam', () => {
      it('should return undefined for non-existent parameter', async () => {
        const paramValue = await firstValueFrom(testingRouterStore.selectQueryParam('nonexistent'));
        expect(paramValue).toBeUndefined();
      });

      it('should return parameter value when it exists', async () => {
        testingRouterStore.setQueryParam('search', 'test');
        const paramValue = await firstValueFrom(testingRouterStore.selectQueryParam('search'));
        expect(paramValue).toBe('test');
      });

      it('should emit new values when parameter changes', (done) => {
        const values: (string | readonly string[] | undefined)[] = [];
        
        testingRouterStore.selectQueryParam('search').pipe(take(3)).subscribe({
          next: (value) => values.push(value),
          complete: () => {
            expect(values).toEqual([undefined, 'hero', 'villain']);
            done();
          },
        });

        testingRouterStore.setQueryParam('search', 'hero');
        testingRouterStore.setQueryParam('search', 'villain');
      });
    });
  });

  describe('route data', () => {
    describe('setRouteData', () => {
      it('should update routeData$', async () => {
        testingRouterStore.setRouteData({ limit: 10, sort: 'name' });
        const routeData = await firstValueFrom(testingRouterStore.routeData$);
        expect(routeData).toEqual({ limit: 10, sort: 'name' });
      });
    });

    describe('setRouteDataParam', () => {
      it('should update individual route data parameter', async () => {
        testingRouterStore.setRouteDataParam('limit', 20);
        const routeData = await firstValueFrom(testingRouterStore.routeData$);
        expect(routeData).toEqual({ limit: 20 });
      });

      it('should preserve other route data when setting individual parameter', async () => {
        testingRouterStore.setRouteData({ limit: 10, sort: 'name' });
        testingRouterStore.setRouteDataParam('limit', 20);
        const routeData = await firstValueFrom(testingRouterStore.routeData$);
        expect(routeData).toEqual({ limit: 20, sort: 'name' });
      });
    });

    describe('selectRouteDataParam', () => {
      it('should return undefined for non-existent parameter', async () => {
        const paramValue = await firstValueFrom(testingRouterStore.selectRouteDataParam('nonexistent'));
        expect(paramValue).toBeUndefined();
      });

      it('should return parameter value when it exists', async () => {
        testingRouterStore.setRouteDataParam('limit', 30);
        const paramValue = await firstValueFrom(testingRouterStore.selectRouteDataParam('limit'));
        expect(paramValue).toBe(30);
      });

      it('should emit new values when parameter changes', (done) => {
        const values: unknown[] = [];
        
        testingRouterStore.selectRouteDataParam('limit').pipe(take(3)).subscribe({
          next: (value) => values.push(value),
          complete: () => {
            expect(values).toEqual([undefined, 10, 20]);
            done();
          },
        });

        testingRouterStore.setRouteDataParam('limit', 10);
        testingRouterStore.setRouteDataParam('limit', 20);
      });
    });

    describe('selectRouteData (deprecated)', () => {
      it('should work the same as selectRouteDataParam', async () => {
        testingRouterStore.setRouteDataParam('test', 'value');
        const value1 = await firstValueFrom(testingRouterStore.selectRouteData('test'));
        const value2 = await firstValueFrom(testingRouterStore.selectRouteDataParam('test'));
        expect(value1).toBe(value2);
      });
    });
  });

  describe('setCurrentRoute', () => {
    it('should update currentRoute$', async () => {
      const customRoute: MinimalActivatedRouteSnapshot = {
        routeConfig: { path: 'test/:id' },
        url: [new UrlSegment('test', {}), new UrlSegment('123', {})],
        params: { id: '123' },
        queryParams: { filter: 'active' },
        fragment: 'top',
        data: { title: 'Test Page' },
        outlet: 'primary',
        title: 'Test Page',
        firstChild: undefined,
        children: [],
      };

      testingRouterStore.setCurrentRoute(customRoute);
      const currentRoute = await firstValueFrom(testingRouterStore.currentRoute$);
      expect(currentRoute).toEqual(customRoute);
    });
  });

  describe('selectRouterEvents', () => {
    it('should return NEVER observable', (done) => {
      const timeout = setTimeout(() => {
        // If we reach here, the observable didn't emit, which is what we expect
        done();
      }, 100);

      testingRouterStore.selectRouterEvents().subscribe({
        next: () => {
          clearTimeout(timeout);
          fail('selectRouterEvents should not emit any values');
        },
      });
    });
  });

  describe('reset', () => {
    it('should reset all values to defaults', async () => {
      // Set some test values
      testingRouterStore.setUrl('/test');
      testingRouterStore.setFragment('section');
      testingRouterStore.setTitle('Test Title');
      testingRouterStore.setRouteParam('id', '123');
      testingRouterStore.setQueryParam('search', 'test');
      testingRouterStore.setRouteDataParam('limit', 10);

      // Reset
      testingRouterStore.reset();

      // Verify all values are back to defaults
      expect(await firstValueFrom(testingRouterStore.url$)).toBe('/');
      expect(await firstValueFrom(testingRouterStore.fragment$)).toBeNull();
      expect(await firstValueFrom(testingRouterStore.title$)).toBeUndefined();
      expect(await firstValueFrom(testingRouterStore.routeParams$)).toEqual({});
      expect(await firstValueFrom(testingRouterStore.queryParams$)).toEqual({});
      expect(await firstValueFrom(testingRouterStore.routeData$)).toEqual({});

      const defaultRoute = await firstValueFrom(testingRouterStore.currentRoute$);
      expect(defaultRoute).toEqual({
        routeConfig: null,
        url: [],
        params: {},
        queryParams: {},
        fragment: null,
        data: {},
        outlet: 'primary',
        title: undefined,
        firstChild: undefined,
        children: [],
      });
    });
  });
});

describe('TestingRouterStore integration', () => {
  it('should work with components', async () => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideTestingRouterStore()],
    });

    const fixture = TestBed.createComponent(TestComponent);
    const testingRouterStore = TestBed.inject(RouterStore) as TestingRouterStore;

    // Set test values
    testingRouterStore.setUrl('/heroes/123');
    testingRouterStore.setFragment('details');
    testingRouterStore.setTitle('Hero Details');
    testingRouterStore.setRouteParam('id', '123');
    testingRouterStore.setQueryParam('search', 'batman');
    testingRouterStore.setRouteDataParam('limit', 50);

    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('#url')?.textContent?.trim()).toBe('/heroes/123');
    expect(compiled.querySelector('#fragment')?.textContent?.trim()).toBe('details');
    expect(compiled.querySelector('#title')?.textContent?.trim()).toBe('Hero Details');
    expect(compiled.querySelector('#route-param')?.textContent?.trim()).toBe('123');
    expect(compiled.querySelector('#query-param')?.textContent?.trim()).toBe('batman');
    expect(compiled.querySelector('#route-data')?.textContent?.trim()).toBe('50');
  });
});

describe('injectTestingRouterStore', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideTestingRouterStore()],
    });
  });

  it('should inject TestingRouterStore without casting', () => {
    TestBed.runInInjectionContext(() => {
      const routerStore = injectTestingRouterStore();
      
      expect(routerStore).toBeInstanceOf(TestingRouterStore);
      expect(typeof routerStore.setUrl).toBe('function');
      expect(typeof routerStore.setRouteParam).toBe('function');
      expect(typeof routerStore.reset).toBe('function');
    });
  });

  it('should provide access to all testing methods', () => {
    TestBed.runInInjectionContext(() => {
      const routerStore = injectTestingRouterStore();
      
      // Test that all testing methods are accessible
      routerStore.setUrl('/test');
      routerStore.setFragment('test');
      routerStore.setTitle('Test');
      routerStore.setRouteParam('id', '123');
      routerStore.setRouteParams({ id: '123', type: 'test' });
      routerStore.setQueryParam('q', 'search');
      routerStore.setQueryParams({ q: 'search', page: '1' });
      routerStore.setRouteDataParam('key', 'value');
      routerStore.setRouteData({ key: 'value' });
      routerStore.setCurrentRoute({
        routeConfig: null,
        url: [],
        params: {},
        queryParams: {},
        fragment: null,
        data: {},
        outlet: 'primary',
        title: undefined,
        firstChild: undefined,
        children: [],
      });
      routerStore.reset();
      
      // If we get here without errors, all methods are accessible
      expect(routerStore).toBeDefined();
    });
  });

  it('should work in component tests', async () => {
    @Component({
      standalone: true,
      template: '<div [attr.data-id]="routeId$ | async"></div>',
      imports: [AsyncPipe],
    })
    class TestInjectionComponent {
      private routerStore = injectTestingRouterStore();
      routeId$ = this.routerStore.selectRouteParam('id');
    }

    TestBed.configureTestingModule({
      imports: [TestInjectionComponent],
      providers: [provideTestingRouterStore()],
    });

    const fixture = TestBed.createComponent(TestInjectionComponent);
    
    // The injectTestingRouterStore should be accessible within the component
    fixture.detectChanges();
    
    // We can't directly access the component's routerStore, but we can verify
    // the injection works by checking the component renders properly
    expect(fixture.nativeElement.querySelector('div')).toBeTruthy();
  });
});

describe('injectTestingRouterStore - Enhanced Options', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideTestingRouterStore()],
    });
  });

  describe('injection options', () => {
    it('should support optional injection', () => {
      TestBed.runInInjectionContext(() => {
        // With optional: false (default behavior)
        const routerStore = injectTestingRouterStore();
        expect(routerStore).toBeInstanceOf(TestingRouterStore);

        // With optional: true - should still work since TestingRouterStore is provided
        const optionalStore = injectTestingRouterStore({ optional: true });
        expect(optionalStore).toBeInstanceOf(TestingRouterStore);
      });
    });

    it('should support host injection option', () => {
      TestBed.runInInjectionContext(() => {
        const routerStore = injectTestingRouterStore({ host: true });
        expect(routerStore).toBeInstanceOf(TestingRouterStore);
        expect(typeof routerStore.setRouteParam).toBe('function');
      });
    });

    it('should support self injection option', () => {
      TestBed.runInInjectionContext(() => {
        const routerStore = injectTestingRouterStore({ self: true });
        expect(routerStore).toBeInstanceOf(TestingRouterStore);
        expect(typeof routerStore.setUrl).toBe('function');
      });
    });

    it('should support skipSelf injection option', () => {
      TestBed.runInInjectionContext(() => {
        const routerStore = injectTestingRouterStore({ skipSelf: false });
        expect(routerStore).toBeInstanceOf(TestingRouterStore);
        expect(typeof routerStore.reset).toBe('function');
      });
    });

    it('should support combined injection options', () => {
      TestBed.runInInjectionContext(() => {
        const routerStore = injectTestingRouterStore({
          optional: false,
          host: true,
          self: false,
        });
        expect(routerStore).toBeInstanceOf(TestingRouterStore);
      });
    });
  });

  describe('component injector support', () => {
    @Component({
      standalone: true,
      selector: 'ngw-test-with-local',
      template: '<p>Test Component</p>',
      providers: [provideTestingRouterStore()], // Local provider
    })
    class TestComponentWithLocalStoreComponent {}

    @Component({
      standalone: true,
      template: '<ngw-test-with-local></ngw-test-with-local>',
      imports: [TestComponentWithLocalStoreComponent],
    })
    class TestParentComponent {}

    it('should inject from specific component injector', () => {
      TestBed.configureTestingModule({
        imports: [TestComponentWithLocalStoreComponent, TestParentComponent],
      });

      const fixture = TestBed.createComponent(TestParentComponent);
      fixture.detectChanges();

      const routerStore = injectTestingRouterStore({
        component: TestComponentWithLocalStoreComponent,
        fixture,
      });

      expect(routerStore).toBeInstanceOf(TestingRouterStore);
      expect(typeof routerStore.setRouteParam).toBe('function');

      // Test that we can use the injected store
      routerStore.setRouteParam('test', 'value');
      expect(routerStore).toBeDefined();
    });

    it('should inject from component with options', () => {
      TestBed.configureTestingModule({
        imports: [TestComponentWithLocalStoreComponent, TestParentComponent],
      });

      const fixture = TestBed.createComponent(TestParentComponent);
      fixture.detectChanges();

      const routerStore = injectTestingRouterStore({
        component: TestComponentWithLocalStoreComponent,
        fixture,
        options: { host: true },
      });

      expect(routerStore).toBeInstanceOf(TestingRouterStore);
      routerStore.setQueryParam('search', 'test');
      expect(routerStore).toBeDefined();
    });

    it('should throw error if component not found in fixture', () => {
      @Component({
        standalone: true,
        template: '<p>Different Component</p>',
      })
      class DifferentComponent {}

      TestBed.configureTestingModule({
        imports: [DifferentComponent],
      });

      const fixture = TestBed.createComponent(DifferentComponent);

      expect(() => {
        injectTestingRouterStore({
          component: TestComponentWithLocalStoreComponent, // This component is not in the fixture
          fixture,
        });
      }).toThrow('Component TestComponentWithLocalStoreComponent not found in fixture');
    });
  });
});

describe('injectTestingRouterStore - Real-world Usage', () => {
  @Component({
    standalone: true,
    selector: 'ngw-hero-detail',
    template: `
      <div class="hero-detail">
        <h1>Hero: {{ heroId$ | async }}</h1>
        <p>Search: {{ search$ | async }}</p>
      </div>
    `,
    imports: [AsyncPipe],
    providers: [provideTestingRouterStore()], // Local testing store
  })
  class HeroDetailComponent {
    private routerStore = inject(RouterStore);
    heroId$ = this.routerStore.selectRouteParam('id');
    search$ = this.routerStore.selectQueryParam('search');
  }

  @Component({
    standalone: true,
    template: '<ngw-hero-detail></ngw-hero-detail>',
    imports: [HeroDetailComponent],
  })
  class AppComponent {}

  it('should work with local router store in real component', () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
    });

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    // Inject from the specific component's injector
    const routerStore = injectTestingRouterStore({
      component: HeroDetailComponent,
      fixture,
    });

    // Set up test data
    routerStore.setRouteParam('id', 'superman');
    routerStore.setQueryParam('search', 'hero');

    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Hero: superman');
    expect(compiled.textContent).toContain('Search: hero');
  });

  it('should demonstrate different injection strategies', () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideTestingRouterStore()], // Global testing store
    });

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    // Strategy 1: Use global testing store with injection context
    TestBed.runInInjectionContext(() => {
      const globalStore = injectTestingRouterStore();
      globalStore.setUrl('/global/test');
      expect(globalStore.url$).toBeDefined();
    });

    // Strategy 2: Use local component store
    const localStore = injectTestingRouterStore({
      component: HeroDetailComponent,
      fixture,
      options: { host: true },
    });

    localStore.setRouteParam('id', 'batman');
    localStore.setQueryParam('search', 'dark knight');

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Hero: batman');
    expect(fixture.nativeElement.textContent).toContain('Search: dark knight');
  });
});