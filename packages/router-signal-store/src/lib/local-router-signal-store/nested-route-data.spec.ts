import { computed } from '@angular/core';
import { RouterConfigOptions, Routes } from '@angular/router';
import { RouterSignalStore } from '../router-signal-store';
import { LocalRouterSignalStore } from './local-router-signal-store';
import { localRouterSignalStoreSetup } from './test-util/local-router-signal-store-setup';
import {
  LocalRouterSignalStoreTestChildComponent,
  LocalRouterSignalStoreTestGrandchildComponent,
  LocalRouterSignalStoreTestParentComponent,
} from './test-util/local-router-signal-store-test-components';
import { StrictRouteData } from '../strict-route-data';

const routes: Routes = [
  {
    path: 'parent',
    component: LocalRouterSignalStoreTestParentComponent,
    data: {
      parent: 'parent-route-data',
      shadowed: 'parent-route-data',
    },
    children: [
      {
        path: 'child',
        component: LocalRouterSignalStoreTestChildComponent,
        data: {
          child: 'child-route-data',
          shadowed: 'child-route-data',
        },
        children: [
          {
            path: 'grandchild',
            component: LocalRouterSignalStoreTestGrandchildComponent,
            data: {
              grandchild: 'grandchild-route-data',
              shadowed: 'grandchild-route-data',
            },
          },
        ],
      },
    ],
  },
];

describe(`${LocalRouterSignalStore.name} nested route data`, () => {
  describe('Given three layers of routes with components and route data', () => {
    const paramsInheritanceStrategies: RouterConfigOptions['paramsInheritanceStrategy'][] =
      ['always', 'emptyOnly'];

    describe.each(paramsInheritanceStrategies)(
      '  And the "%s" route parameter inheritance strategy is used',
      (paramsInheritanceStrategy) => {
        it.each(['/parent/child/grandchild', '/parent/child', '/parent'])(
          `  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestParentComponent.name}
        When the "%s" route is activated
        Then route data for the ${LocalRouterSignalStoreTestParentComponent.name} route is emitted`,
          async (navigateTo) => {
            const { activatedRoute, routerSignalStore, toSignal } =
              await localRouterSignalStoreSetup({
                navigateTo,
                paramsInheritanceStrategy,
                RoutedComponent: LocalRouterSignalStoreTestParentComponent,
                routes,
              });

            const expectedRouteData: StrictRouteData = {
              parent: 'parent-route-data',
              shadowed: 'parent-route-data',
            };
            expect(routerSignalStore.routeData()).toEqual(expectedRouteData);
            expect(toSignal(activatedRoute.data)()).toEqual(expectedRouteData);
            const actualRouteData = computed(() => ({
              parent: routerSignalStore.selectRouteDataParam('parent')(),
              shadowed: routerSignalStore.selectRouteDataParam('shadowed')(),
            }));
            expect(actualRouteData()).toEqual(expectedRouteData);
          }
        );
      }
    );

    describe('And the default route parameter inheritance strategy is used', () => {
      it.each(['/parent/child/grandchild', '/parent/child'])(
        `  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestChildComponent.name}
      When the "%s" route is activated
      Then route data for the ${LocalRouterSignalStoreTestChildComponent.name} route is emitted`,
        async (navigateTo) => {
          const { activatedRoute, routerSignalStore, toSignal } =
            await localRouterSignalStoreSetup({
              navigateTo,
              RoutedComponent: LocalRouterSignalStoreTestChildComponent,
              routes,
            });

          const expectedRouteData: StrictRouteData = {
            child: 'child-route-data',
            shadowed: 'child-route-data',
          };
          expect(routerSignalStore.routeData()).toEqual(expectedRouteData);
          expect(toSignal(activatedRoute.data)()).toEqual(expectedRouteData);
          const actualRouteData = computed(() => ({
            child: routerSignalStore.selectRouteDataParam('child')(),
            shadowed: routerSignalStore.selectRouteDataParam('shadowed')(),
          }));
          expect(actualRouteData()).toEqual(expectedRouteData);
        }
      );

      it(`  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestGrandchildComponent.name}
      When the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is activated
      Then route data for the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is emitted`, async () => {
        const { activatedRoute, routerSignalStore, toSignal } =
          await localRouterSignalStoreSetup({
            navigateTo: '/parent/child/grandchild',
            RoutedComponent: LocalRouterSignalStoreTestGrandchildComponent,
            routes,
          });

        const expectedRouteData: StrictRouteData = {
          grandchild: 'grandchild-route-data',
          shadowed: 'grandchild-route-data',
        };
        expect(routerSignalStore.routeData()).toEqual(expectedRouteData);
        expect(toSignal(activatedRoute.data)()).toEqual(expectedRouteData);
        const actualRouteData = computed(() => ({
          grandchild: routerSignalStore.selectRouteDataParam('grandchild')(),
          shadowed: routerSignalStore.selectRouteDataParam('shadowed')(),
        }));
        expect(actualRouteData()).toEqual(expectedRouteData);
      });
    });

    describe('And the "always" route parameter inheritance strategy is used', () => {
      it.each(['/parent/child/grandchild', '/parent/child'])(
        `  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestChildComponent.name}
      When the "%s" route is activated
      Then route data for the ${LocalRouterSignalStoreTestChildComponent.name} route is emitted
        And route data for the ${LocalRouterSignalStoreTestParentComponent.name} route is emitted
        And route data is merged top-down`,
        async (navigateTo) => {
          const { activatedRoute, routerSignalStore, toSignal } =
            await localRouterSignalStoreSetup({
              navigateTo,
              paramsInheritanceStrategy: 'always',
              RoutedComponent: LocalRouterSignalStoreTestChildComponent,
              routes,
            });

          const expectedRouteData: StrictRouteData = {
            parent: 'parent-route-data',
            child: 'child-route-data',
            shadowed: 'child-route-data',
          };
          expect(routerSignalStore.routeData()).toEqual(expectedRouteData);
          expect(toSignal(activatedRoute.data)()).toEqual(expectedRouteData);
          const actualRouteData = computed(() => ({
            parent: routerSignalStore.selectRouteDataParam('parent')(),
            child: routerSignalStore.selectRouteDataParam('child')(),
            shadowed: routerSignalStore.selectRouteDataParam('shadowed')(),
          }));
          expect(actualRouteData()).toEqual(expectedRouteData);
        }
      );

      it(`  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestGrandchildComponent.name}
      When the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is activated
      Then route data for the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is emitted
        And route data for the ${LocalRouterSignalStoreTestChildComponent.name} route is emitted
        And route data for the ${LocalRouterSignalStoreTestParentComponent.name} route is emitted
        And route data is merged top-down`, async () => {
        const { activatedRoute, routerSignalStore, toSignal } =
          await localRouterSignalStoreSetup({
            navigateTo: '/parent/child/grandchild',
            paramsInheritanceStrategy: 'always',
            RoutedComponent: LocalRouterSignalStoreTestGrandchildComponent,
            routes,
          });

        const expectedRouteData: StrictRouteData = {
          parent: 'parent-route-data',
          child: 'child-route-data',
          grandchild: 'grandchild-route-data',
          shadowed: 'grandchild-route-data',
        };
        expect(routerSignalStore.routeData()).toEqual(expectedRouteData);
        expect(toSignal(activatedRoute.data)()).toEqual(expectedRouteData);
        const actualRouteData = computed(() => ({
          parent: routerSignalStore.selectRouteDataParam('parent')(),
          child: routerSignalStore.selectRouteDataParam('child')(),
          grandchild: routerSignalStore.selectRouteDataParam('grandchild')(),
          shadowed: routerSignalStore.selectRouteDataParam('shadowed')(),
        }));
        expect(actualRouteData()).toEqual(expectedRouteData);
      });
    });
  });
});
