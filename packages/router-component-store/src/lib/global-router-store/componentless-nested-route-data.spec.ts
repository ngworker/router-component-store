import { RouterConfigOptions, Routes } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MinimalRouteData } from '../minimal-route-data';
import { RouterStore } from '../router-store';
import { GlobalRouterStore } from './global-router-store';
import { globalRouterStoreSetup } from './test-util/global-router-store-setup';
import {
  GlobalRouterStoreTestChildComponent,
  GlobalRouterStoreTestGrandchildComponent,
  GlobalRouterStoreTestParentComponent,
} from './test-util/global-router-store-test-components';

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
        component: GlobalRouterStoreTestParentComponent,
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
                component: GlobalRouterStoreTestChildComponent,
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
                        component: GlobalRouterStoreTestGrandchildComponent,
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

describe(`${GlobalRouterStore.name} componentless nested route data`, () => {
  describe(`Given three layers of routes with components and route data
    And a componentless route with route data before each of them`, () => {
    const paramsInheritanceStrategies: RouterConfigOptions['paramsInheritanceStrategy'][] =
      ['always', 'emptyOnly'];

    describe.each(paramsInheritanceStrategies)(
      '  And the "%s" route parameter inheritance strategy is used',
      (paramsInheritanceStrategy) => {
        it.each(
          [
            GlobalRouterStoreTestParentComponent,
            GlobalRouterStoreTestChildComponent,
            GlobalRouterStoreTestGrandchildComponent,
          ].map((RoutedComponent) => ({ RoutedComponent }))
        )(
          `  And ${RouterStore.name} is injected at $RoutedComponent.name
        When the ${GlobalRouterStoreTestGrandchildComponent.name} route is activated
        Then route data for the ${GlobalRouterStoreTestGrandchildComponent.name} route is emitted
          And componentless route data before the ${GlobalRouterStoreTestGrandchildComponent.name} is emitted
          And route data for the ${GlobalRouterStoreTestChildComponent.name} route is emitted
          And componentless route data before the ${GlobalRouterStoreTestChildComponent.name} is emitted
          And route data for the ${GlobalRouterStoreTestParentComponent.name} route is emitted
          And componentless route data before the ${GlobalRouterStoreTestParentComponent.name} is emitted`,
          async ({ RoutedComponent }) => {
            expect.assertions(3);
            const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
              await globalRouterStoreSetup({
                navigateTo: '/parent/child/grandchild',
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            const expectedRouteData: MinimalRouteData = {
              componentlessBeforeParent:
                'componentless-route-data-before-parent',
              parent: 'parent-route-data',
              componentlessBeforeChild: 'componentless-route-data-before-child',
              child: 'child-route-data',
              componentlessBeforeGrandchild:
                'componentless-route-data-before-grandchild',
              grandchild: 'grandchild-route-data',
              shadowed: 'grandchild-route-data',
            };
            await expect(
              firstValueFrom(routerStore.routeData$)
            ).resolves.toEqual(expectedRouteData);
            await expect(
              firstValueFrom(ngrxStore.select(ngrxRouterStore.selectRouteData))
            ).resolves.toEqual(expectedRouteData);
            await expect(
              firstValueFrom(
                componentStore.select({
                  componentlessBeforeParent: routerStore.selectRouteData(
                    'componentlessBeforeParent'
                  ),
                  parent: routerStore.selectRouteData('parent'),
                  componentlessBeforeChild: routerStore.selectRouteData(
                    'componentlessBeforeChild'
                  ),
                  child: routerStore.selectRouteData('child'),
                  componentlessBeforeGrandchild: routerStore.selectRouteData(
                    'componentlessBeforeGrandchild'
                  ),
                  grandchild: routerStore.selectRouteData('grandchild'),
                  shadowed: routerStore.selectRouteData('shadowed'),
                })
              )
            ).resolves.toEqual(expectedRouteData);
          }
        );

        it.each(
          [
            GlobalRouterStoreTestParentComponent,
            GlobalRouterStoreTestChildComponent,
          ].map((RoutedComponent) => ({
            RoutedComponent,
          }))
        )(
          `  And ${RouterStore.name} is injected at $RoutedComponent.name
        When the ${GlobalRouterStoreTestChildComponent.name} route is activated
        Then componentless route data before the ${GlobalRouterStoreTestGrandchildComponent.name} is emitted
          And route data for the ${GlobalRouterStoreTestChildComponent.name} route is emitted
          And componentless route data before the ${GlobalRouterStoreTestChildComponent.name} is emitted
          And route data for the ${GlobalRouterStoreTestParentComponent.name} route is emitted
          And componentless route data before the ${GlobalRouterStoreTestParentComponent.name} is emitted`,
          async ({ RoutedComponent }) => {
            expect.assertions(3);
            const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
              await globalRouterStoreSetup({
                navigateTo: '/parent/child',
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            const expectedRouteData: MinimalRouteData = {
              componentlessBeforeParent:
                'componentless-route-data-before-parent',
              parent: 'parent-route-data',
              componentlessBeforeChild: 'componentless-route-data-before-child',
              child: 'child-route-data',
              componentlessBeforeGrandchild:
                'componentless-route-data-before-grandchild',
              shadowed: 'componentless-route-data-before-grandchild',
            };
            await expect(
              firstValueFrom(routerStore.routeData$)
            ).resolves.toEqual(expectedRouteData);
            await expect(
              firstValueFrom(ngrxStore.select(ngrxRouterStore.selectRouteData))
            ).resolves.toEqual(expectedRouteData);
            await expect(
              firstValueFrom(
                componentStore.select({
                  componentlessBeforeParent: routerStore.selectRouteData(
                    'componentlessBeforeParent'
                  ),
                  parent: routerStore.selectRouteData('parent'),
                  componentlessBeforeChild: routerStore.selectRouteData(
                    'componentlessBeforeChild'
                  ),
                  child: routerStore.selectRouteData('child'),
                  componentlessBeforeGrandchild: routerStore.selectRouteData(
                    'componentlessBeforeGrandchild'
                  ),
                  shadowed: routerStore.selectRouteData('shadowed'),
                })
              )
            ).resolves.toEqual(expectedRouteData);
          }
        );

        it(`  And ${RouterStore.name} is injected at ${GlobalRouterStoreTestParentComponent.name}
        When the ${GlobalRouterStoreTestParentComponent.name} route is activated
        Then componentless route data before the ${GlobalRouterStoreTestChildComponent.name} is emitted
          And route data for the ${GlobalRouterStoreTestParentComponent.name} route is emitted
          And componentless route data before the ${GlobalRouterStoreTestParentComponent.name} is emitted`, async () => {
          expect.assertions(3);
          const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
            await globalRouterStoreSetup({
              navigateTo: '/parent',
              paramsInheritanceStrategy,
              RoutedComponent: GlobalRouterStoreTestParentComponent,
              routes,
            });

          const expectedRouteData: MinimalRouteData = {
            componentlessBeforeParent: 'componentless-route-data-before-parent',
            parent: 'parent-route-data',
            componentlessBeforeChild: 'componentless-route-data-before-child',
            shadowed: 'componentless-route-data-before-child',
          };
          await expect(firstValueFrom(routerStore.routeData$)).resolves.toEqual(
            expectedRouteData
          );
          await expect(
            firstValueFrom(ngrxStore.select(ngrxRouterStore.selectRouteData))
          ).resolves.toEqual(expectedRouteData);
          await expect(
            firstValueFrom(
              componentStore.select({
                componentlessBeforeParent: routerStore.selectRouteData(
                  'componentlessBeforeParent'
                ),
                parent: routerStore.selectRouteData('parent'),
                componentlessBeforeChild: routerStore.selectRouteData(
                  'componentlessBeforeChild'
                ),
                shadowed: routerStore.selectRouteData('shadowed'),
              })
            )
          ).resolves.toEqual(expectedRouteData);
        });
      }
    );
  });
});
