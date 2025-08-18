import { RouterConfigOptions, Routes } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RouterStore } from '../router-store';
import { StrictRouteData } from '../strict-route-data';
import { LocalRouterStore } from './local-router-store';
import { localRouterStoreSetup } from './test-util/local-router-store-setup';
import {
  LocalRouterStoreTestChildComponent,
  LocalRouterStoreTestGrandchildComponent,
  LocalRouterStoreTestParentComponent,
} from './test-util/local-router-store-test-components';

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
        component: LocalRouterStoreTestParentComponent,
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
                component: LocalRouterStoreTestChildComponent,
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
                        component: LocalRouterStoreTestGrandchildComponent,
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

describe(`${LocalRouterStore.name} componentless nested route data`, () => {
  describe(`Given three layers of routes with components and route data
    And a componentless route with route data before each of them`, () => {
    const paramsInheritanceStrategies: RouterConfigOptions['paramsInheritanceStrategy'][] =
      ['always', 'emptyOnly'];

    describe.each(paramsInheritanceStrategies)(
      '  And the "%s" route parameter inheritance strategy is used',
      (paramsInheritanceStrategy) => {
        it.each(['/parent/child/grandchild', '/parent/child', '/parent'])(
          `  And ${RouterStore.name} is injected at ${LocalRouterStoreTestParentComponent.name}
        When the "%s" route is activated
        Then route data for the ${LocalRouterStoreTestParentComponent.name} route is emitted
          And componentless route data before the ${LocalRouterStoreTestParentComponent.name} is emitted`,
          async (navigateTo) => {
            expect.assertions(3);
            const { activatedRoute, componentStore, routerStore } =
              await localRouterStoreSetup({
                navigateTo,
                paramsInheritanceStrategy,
                RoutedComponent: LocalRouterStoreTestParentComponent,
                routes,
              });

            const expectedRouteData: StrictRouteData = {
              componentlessBeforeParent:
                'componentless-route-data-before-parent',
              parent: 'parent-route-data',
              shadowed: 'parent-route-data',
            };
            await expect(
              firstValueFrom(routerStore.routeData$)
            ).resolves.toEqual(expectedRouteData);
            await expect(firstValueFrom(activatedRoute.data)).resolves.toEqual(
              expectedRouteData
            );
            await expect(
              firstValueFrom(
                componentStore.select({
                  componentlessBeforeParent: routerStore.selectRouteDataParam(
                    'componentlessBeforeParent'
                  ),
                  parent: routerStore.selectRouteDataParam('parent'),
                  shadowed: routerStore.selectRouteDataParam('shadowed'),
                })
              )
            ).resolves.toEqual(expectedRouteData);
          }
        );

        it.each(['/parent/child/grandchild', '/parent/child'])(
          `  And ${RouterStore.name} is injected at ${LocalRouterStoreTestChildComponent.name}
        When the "%s" route is activated
        Then route data for the ${LocalRouterStoreTestChildComponent.name} route is emitted
          And componentless route data before the ${LocalRouterStoreTestChildComponent.name} is emitted
          And route data for the ${LocalRouterStoreTestParentComponent.name} route is emitted
          And componentless route data before the ${LocalRouterStoreTestParentComponent.name} is emitted`,
          async (navigateTo) => {
            expect.assertions(3);
            const { activatedRoute, componentStore, routerStore } =
              await localRouterStoreSetup({
                navigateTo,
                paramsInheritanceStrategy,
                RoutedComponent: LocalRouterStoreTestChildComponent,
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
            await expect(
              firstValueFrom(routerStore.routeData$)
            ).resolves.toEqual(expectedRouteData);
            await expect(firstValueFrom(activatedRoute.data)).resolves.toEqual(
              expectedRouteData
            );
            await expect(
              firstValueFrom(
                componentStore.select({
                  componentlessBeforeParent: routerStore.selectRouteDataParam(
                    'componentlessBeforeParent'
                  ),
                  parent: routerStore.selectRouteDataParam('parent'),
                  componentlessBeforeChild: routerStore.selectRouteDataParam(
                    'componentlessBeforeChild'
                  ),
                  child: routerStore.selectRouteDataParam('child'),
                  shadowed: routerStore.selectRouteDataParam('shadowed'),
                })
              )
            ).resolves.toEqual(expectedRouteData);
          }
        );

        it(`  And ${RouterStore.name} is injected at ${LocalRouterStoreTestGrandchildComponent.name}
        When the ${LocalRouterStoreTestGrandchildComponent.name} route is activated
        Then route data for the ${LocalRouterStoreTestGrandchildComponent.name} route is emitted
          And componentless route data before the ${LocalRouterStoreTestGrandchildComponent.name} is emitted
          And route data for the ${LocalRouterStoreTestChildComponent.name} route is emitted
          And componentless route data before the ${LocalRouterStoreTestChildComponent.name} is emitted
          And route data for the ${LocalRouterStoreTestParentComponent.name} route is emitted
          And componentless route data before the ${LocalRouterStoreTestParentComponent.name} is emitted`, async () => {
          expect.assertions(3);
          const { activatedRoute, componentStore, routerStore } =
            await localRouterStoreSetup({
              paramsInheritanceStrategy,
              navigateTo: '/parent/child/grandchild',
              RoutedComponent: LocalRouterStoreTestGrandchildComponent,
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
          await expect(firstValueFrom(routerStore.routeData$)).resolves.toEqual(
            expectedRouteData
          );
          await expect(firstValueFrom(activatedRoute.data)).resolves.toEqual(
            expectedRouteData
          );
          await expect(
            firstValueFrom(
              componentStore.select({
                componentlessBeforeParent: routerStore.selectRouteDataParam(
                  'componentlessBeforeParent'
                ),
                parent: routerStore.selectRouteDataParam('parent'),
                componentlessBeforeChild: routerStore.selectRouteDataParam(
                  'componentlessBeforeChild'
                ),
                child: routerStore.selectRouteDataParam('child'),
                componentlessBeforeGrandchild: routerStore.selectRouteDataParam(
                  'componentlessBeforeGrandchild'
                ),
                grandchild: routerStore.selectRouteDataParam('grandchild'),
                shadowed: routerStore.selectRouteDataParam('shadowed'),
              })
            )
          ).resolves.toEqual(expectedRouteData);
        });
      }
    );
  });
});
