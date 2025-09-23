import { computed } from '@angular/core';
import { RouterConfigOptions, Routes } from '@angular/router';

import { RouterSignalStore } from '../router-signal-store';
import { StrictRouteData } from '../strict-route-data';
import { LocalRouterSignalStore } from './local-router-signal-store';
import { localRouterSignalStoreSetup } from './test-util/local-router-signal-store-setup';
import {
  LocalRouterSignalStoreTestChildComponent,
  LocalRouterSignalStoreTestGrandchildComponent,
  LocalRouterSignalStoreTestParentComponent,
} from './test-util/local-router-signal-store-test-components';

const routes: Routes = [
  {
    path: '',
    data: {
      componentlessBeforeParent: 'componentless-route-data-before-parent',
      shadowed: 'componentless-route-data-before-parent',
    },
    children: [
      {
        path: 'parent',
        component: LocalRouterSignalStoreTestParentComponent,
        data: {
          parent: 'parent-route-data',
          shadowed: 'parent-route-data',
        },
        children: [
          {
            path: '',
            data: {
              componentlessBeforeChild: 'componentless-route-data-before-child',
              shadowed: 'componentless-route-data-before-child',
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
                    path: '',
                    data: {
                      componentlessBeforeGrandchild:
                        'componentless-route-data-before-grandchild',
                      shadowed: 'componentless-route-data-before-grandchild',
                    },
                    children: [
                      {
                        path: 'grandchild',
                        component:
                          LocalRouterSignalStoreTestGrandchildComponent,
                        data: {
                          grandchild: 'grandchild-route-data',
                          shadowed: 'grandchild-route-data',
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

describe(`${LocalRouterSignalStore.name} componentless nested route data`, () => {
  describe(`Given three layers of routes with components and route data
    And a componentless route with route data before each of them`, () => {
    const paramsInheritanceStrategies: RouterConfigOptions['paramsInheritanceStrategy'][] =
      ['always', 'emptyOnly'];

    describe.each(paramsInheritanceStrategies)(
      '  And the "%s" route parameter inheritance strategy is used',
      (paramsInheritanceStrategy) => {
        it.each(['/parent/child/grandchild', '/parent/child', '/parent'])(
          `  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestParentComponent.name}
        When the "%s" route is activated
        Then route data for the ${LocalRouterSignalStoreTestParentComponent.name} route is emitted
          And componentless route data before the ${LocalRouterSignalStoreTestParentComponent.name} is emitted`,
          async (navigateTo) => {
            const { routerSignalStore } = await localRouterSignalStoreSetup({
              navigateTo,
              paramsInheritanceStrategy,
              RoutedComponent: LocalRouterSignalStoreTestParentComponent,
              routes,
            });

            const expectedRouteData: StrictRouteData = {
              componentlessBeforeParent:
                'componentless-route-data-before-parent',
              parent: 'parent-route-data',
              shadowed: 'parent-route-data',
            };
            expect(routerSignalStore.routeData()).toEqual(expectedRouteData);
            const actualRouteData = computed(() => ({
              componentlessBeforeParent: routerSignalStore.selectRouteDataParam(
                'componentlessBeforeParent'
              )(),
              parent: routerSignalStore.selectRouteDataParam('parent')(),
              shadowed: routerSignalStore.selectRouteDataParam('shadowed')(),
            }));
            expect(actualRouteData()).toEqual(expectedRouteData);
          }
        );

        it.each(['/parent/child/grandchild', '/parent/child'])(
          `  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestChildComponent.name}
        When the "%s" route is activated
        Then route data for the ${LocalRouterSignalStoreTestChildComponent.name} route is emitted
          And componentless route data before the ${LocalRouterSignalStoreTestChildComponent.name} is emitted
          And route data for the ${LocalRouterSignalStoreTestParentComponent.name} route is emitted
          And componentless route data before the ${LocalRouterSignalStoreTestParentComponent.name} is emitted`,
          async (navigateTo) => {
            const { routerSignalStore } = await localRouterSignalStoreSetup({
              navigateTo,
              paramsInheritanceStrategy,
              RoutedComponent: LocalRouterSignalStoreTestChildComponent,
              routes,
            });

            const expectedRouteData: StrictRouteData = {
              componentlessBeforeParent:
                'componentless-route-data-before-parent',
              parent: 'parent-route-data',
              componentlessBeforeChild: 'componentless-route-data-before-child',
              child: 'child-route-data',
              shadowed: 'child-route-data',
            };
            expect(routerSignalStore.routeData()).toEqual(expectedRouteData);
            const actualRouteData = computed(() => ({
              componentlessBeforeParent: routerSignalStore.selectRouteDataParam(
                'componentlessBeforeParent'
              )(),
              parent: routerSignalStore.selectRouteDataParam('parent')(),
              componentlessBeforeChild: routerSignalStore.selectRouteDataParam(
                'componentlessBeforeChild'
              )(),
              child: routerSignalStore.selectRouteDataParam('child')(),
              shadowed: routerSignalStore.selectRouteDataParam('shadowed')(),
            }));
            expect(actualRouteData()).toEqual(expectedRouteData);
          }
        );

        it(`  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestGrandchildComponent.name}
        When the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is activated
        Then route data for the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is emitted
          And componentless route data before the ${LocalRouterSignalStoreTestGrandchildComponent.name} is emitted
          And route data for the ${LocalRouterSignalStoreTestChildComponent.name} route is emitted
          And componentless route data before the ${LocalRouterSignalStoreTestChildComponent.name} is emitted
          And route data for the ${LocalRouterSignalStoreTestParentComponent.name} route is emitted
          And componentless route data before the ${LocalRouterSignalStoreTestParentComponent.name} is emitted`, async () => {
          const { routerSignalStore } = await localRouterSignalStoreSetup({
            paramsInheritanceStrategy,
            navigateTo: '/parent/child/grandchild',
            RoutedComponent: LocalRouterSignalStoreTestGrandchildComponent,
            routes,
          });

          const expectedRouteData: StrictRouteData = {
            componentlessBeforeParent: 'componentless-route-data-before-parent',
            parent: 'parent-route-data',
            componentlessBeforeChild: 'componentless-route-data-before-child',
            child: 'child-route-data',
            componentlessBeforeGrandchild:
              'componentless-route-data-before-grandchild',
            grandchild: 'grandchild-route-data',
            shadowed: 'grandchild-route-data',
          };
          expect(routerSignalStore.routeData()).toEqual(expectedRouteData);
          const actualRouteData = computed(() => ({
            componentlessBeforeParent: routerSignalStore.selectRouteDataParam(
              'componentlessBeforeParent'
            )(),
            parent: routerSignalStore.selectRouteDataParam('parent')(),
            componentlessBeforeChild: routerSignalStore.selectRouteDataParam(
              'componentlessBeforeChild'
            )(),
            child: routerSignalStore.selectRouteDataParam('child')(),
            componentlessBeforeGrandchild:
              routerSignalStore.selectRouteDataParam(
                'componentlessBeforeGrandchild'
              )(),
            grandchild: routerSignalStore.selectRouteDataParam('grandchild')(),
            shadowed: routerSignalStore.selectRouteDataParam('shadowed')(),
          }));
          expect(actualRouteData()).toEqual(expectedRouteData);
        });
      }
    );
  });
});
