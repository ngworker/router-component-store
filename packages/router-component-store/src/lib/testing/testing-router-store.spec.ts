import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UrlSegment } from '@angular/router';
import { firstValueFrom, take } from 'rxjs';
import { MinimalActivatedRouteSnapshot } from '../@ngrx/router-store/minimal-activated-route-state-snapshot';
import { RouterStore } from '../router-store';
import { provideTestingRouterStore } from './provide-testing-router-store';
import { TestingRouterStore } from './testing-router-store';

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