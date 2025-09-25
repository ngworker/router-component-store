import { ClassProvider, Provider } from '@angular/core';
import { RouterStore } from '../router-store';
import { TestingRouterStore } from './testing-router-store';

/**
 * Provide a testing version of `RouterStore` that uses stubbed observables
 * for easy test setup and improved developer experience.
 * 
 * This provider replaces the `RouterStore` dependency injection token with
 * `TestingRouterStore`, allowing you to easily control router state in your tests.
 *
 * @returns The providers required for a testing router store.
 *
 * @example
 * ```typescript
 * // Basic usage in TestBed
 * TestBed.configureTestingModule({
 *   providers: [provideTestingRouterStore()],
 * });
 * 
 * const routerStore = TestBed.inject(RouterStore) as TestingRouterStore;
 * routerStore.setUrl('/test/123');
 * routerStore.setRouteParam('id', '123');
 * ```
 * 
 * @example
 * ```typescript
 * // Usage with component testing
 * @Component({
 *   template: '<div>{{ routeId$ | async }}</div>'
 * })
 * class TestComponent {
 *   private routerStore = inject(RouterStore);
 *   routeId$ = this.routerStore.selectRouteParam('id');
 * }
 * 
 * describe('TestComponent', () => {
 *   let component: TestComponent;
 *   let routerStore: TestingRouterStore;
 * 
 *   beforeEach(async () => {
 *     await TestBed.configureTestingModule({
 *       imports: [TestComponent],
 *       providers: [provideTestingRouterStore()],
 *     }).compileComponents();
 * 
 *     routerStore = TestBed.inject(RouterStore) as TestingRouterStore;
 *   });
 * 
 *   it('should display route parameter', () => {
 *     routerStore.setRouteParam('id', '123');
 *     fixture.detectChanges();
 *     
 *     expect(fixture.nativeElement.textContent).toBe('123');
 *   });
 * });
 * ```
 * 
 * @example
 * ```typescript
 * // Usage with service testing
 * class HeroService {
 *   private routerStore = inject(RouterStore);
 *   heroId$ = this.routerStore.selectRouteParam('id');
 * }
 * 
 * describe('HeroService', () => {
 *   let service: HeroService;
 *   let routerStore: TestingRouterStore;
 * 
 *   beforeEach(() => {
 *     TestBed.configureTestingModule({
 *       providers: [HeroService, provideTestingRouterStore()],
 *     });
 * 
 *     service = TestBed.inject(HeroService);
 *     routerStore = TestBed.inject(RouterStore) as TestingRouterStore;
 *   });
 * 
 *   it('should emit hero ID when route param changes', (done) => {
 *     service.heroId$.subscribe(id => {
 *       expect(id).toBe('456');
 *       done();
 *     });
 * 
 *     routerStore.setRouteParam('id', '456');
 *   });
 * });
 * ```
 */
export function provideTestingRouterStore(): Provider[] {
  const testingRouterStoreProvider: ClassProvider = {
    provide: RouterStore,
    useClass: TestingRouterStore,
  };

  return [testingRouterStoreProvider];
}