import { TestBed } from '@angular/core/testing';
import { RouterStore } from '../router-store';
import { provideTestingRouterStore } from './provide-testing-router-store';
import { TestingRouterStore } from './testing-router-store';

describe('provideTestingRouterStore', () => {
  it('should provide TestingRouterStore for RouterStore token', () => {
    TestBed.configureTestingModule({
      providers: [provideTestingRouterStore()],
    });

    const routerStore = TestBed.inject(RouterStore);

    expect(routerStore).toBeInstanceOf(TestingRouterStore);
  });

  it('should allow casting to TestingRouterStore for access to testing methods', () => {
    TestBed.configureTestingModule({
      providers: [provideTestingRouterStore()],
    });

    const routerStore = TestBed.inject(RouterStore);
    const testingRouterStore = routerStore as TestingRouterStore;

    // Should have access to testing methods
    expect(typeof testingRouterStore.setUrl).toBe('function');
    expect(typeof testingRouterStore.setRouteParam).toBe('function');
    expect(typeof testingRouterStore.setQueryParam).toBe('function');
    expect(typeof testingRouterStore.setRouteDataParam).toBe('function');
    expect(typeof testingRouterStore.reset).toBe('function');
  });
});