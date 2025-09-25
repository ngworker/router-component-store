import { TestBed } from '@angular/core/testing';
import { RouterStore } from '../router-store';
import { injectTestingRouterStore, provideTestingRouterStore, TestingRouterStore } from '../testing';

describe('injectTestingRouterStore - Usage Examples', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideTestingRouterStore()],
    });
  });

  it('demonstrates the old way vs the new way', () => {
    // OLD WAY: Manual casting required
    const oldWay = TestBed.inject(RouterStore) as TestingRouterStore;
    oldWay.setRouteParam('id', 'old-way');

    // NEW WAY: No casting needed with injection helper
    TestBed.runInInjectionContext(() => {
      const newWay = injectTestingRouterStore();
      newWay.setRouteParam('id', 'new-way');
    });

    // Both approaches work, but the new way provides better type safety
    expect(oldWay).toBeInstanceOf(TestingRouterStore);
    expect(() => {
      TestBed.runInInjectionContext(() => {
        const newWay = injectTestingRouterStore();
        expect(newWay).toBeInstanceOf(TestingRouterStore);
      });
    }).not.toThrow();
  });

  it('provides immediate access to testing methods', () => {
    TestBed.runInInjectionContext(() => {
      const routerStore = injectTestingRouterStore();
      
      // Direct access to all testing methods without casting
      routerStore.setUrl('/test/path');
      routerStore.setRouteParam('id', '123');
      routerStore.setQueryParam('search', 'test');
      routerStore.setFragment('section');
      routerStore.setTitle('Test Page');
      
      // TypeScript IntelliSense will work perfectly
      expect(typeof routerStore.reset).toBe('function');
    });
  });
});