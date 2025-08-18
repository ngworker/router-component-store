import { Routes } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RouterStore } from '../router-store';
import { StrictRouteData } from '../strict-route-data';
import { GlobalRouterStore } from './global-router-store';
import { globalRouterStoreSetup } from './test-util/global-router-store-setup';
import {
  GlobalRouterStoreTestChildComponent,
  GlobalRouterStoreTestGrandchildComponent,
  GlobalRouterStoreTestParentComponent,
} from './test-util/global-router-store-test-components';

const routes: Routes = [
  {
    path: 'parent',
    component: GlobalRouterStoreTestParentComponent,
    data: {
      parent: 'parent-route-data',
      shadowed: 'parent-route-data',
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
];

describe(`${GlobalRouterStore.name} nested route data`, () => {
  describe('Given three layers of routes with components and route data', () => {
    describe('And the default route parameter inheritance strategy is used', () => {
      it.each(
        [
          GlobalRouterStoreTestParentComponent,
          GlobalRouterStoreTestChildComponent,
          GlobalRouterStoreTestGrandchildComponent,
        ].map((RoutedComponent) => ({ RoutedComponent }))
      )(
        `  And ${RouterStore.name} is injected at $RoutedComponent.name
      When the ${GlobalRouterStoreTestGrandchildComponent.name} route is activated
      Then route data for the ${GlobalRouterStoreTestGrandchildComponent.name} route is emitted`,
        async ({ RoutedComponent }) => {
          expect.assertions(4);
          const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
            await globalRouterStoreSetup({
              navigateTo: '/parent/child/grandchild',
              RoutedComponent,
              routes,
            });

          const expectedRouteData: StrictRouteData = {
            grandchild: 'grandchild-route-data',
            shadowed: 'grandchild-route-data',
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
                grandchild: routerStore.selectRouteData('grandchild'),
                shadowed: routerStore.selectRouteData('shadowed'),
              })
            )
          ).resolves.toEqual(expectedRouteData);
          await expect(
            firstValueFrom(
              componentStore.select({
                grandchild: ngrxStore.select(
                  ngrxRouterStore.selectRouteDataParam('grandchild')
                ),
                shadowed: ngrxStore.select(
                  ngrxRouterStore.selectRouteDataParam('shadowed')
                ),
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
      Then route data for the ${GlobalRouterStoreTestChildComponent.name} route is emitted`,
        async ({ RoutedComponent }) => {
          expect.assertions(4);
          const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
            await globalRouterStoreSetup({
              navigateTo: '/parent/child',
              RoutedComponent,
              routes,
            });

          const expectedRouteData: StrictRouteData = {
            child: 'child-route-data',
            shadowed: 'child-route-data',
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
                child: routerStore.selectRouteData('child'),
                shadowed: routerStore.selectRouteData('shadowed'),
              })
            )
          ).resolves.toEqual(expectedRouteData);
          await expect(
            firstValueFrom(
              componentStore.select({
                child: ngrxStore.select(
                  ngrxRouterStore.selectRouteDataParam('child')
                ),
                shadowed: ngrxStore.select(
                  ngrxRouterStore.selectRouteDataParam('shadowed')
                ),
              })
            )
          ).resolves.toEqual(expectedRouteData);
        }
      );

      it(`  And ${RouterStore.name} is injected at ${GlobalRouterStoreTestParentComponent.name}
      When the ${GlobalRouterStoreTestParentComponent.name} route is activated
      Then route data for the ${GlobalRouterStoreTestParentComponent.name} route is emitted`, async () => {
        expect.assertions(4);
        const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
          await globalRouterStoreSetup({
            navigateTo: '/parent',
            RoutedComponent: GlobalRouterStoreTestParentComponent,
            routes,
          });

        const expectedRouteData: StrictRouteData = {
          parent: 'parent-route-data',
          shadowed: 'parent-route-data',
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
              parent: routerStore.selectRouteData('parent'),
              shadowed: routerStore.selectRouteData('shadowed'),
            })
          )
        ).resolves.toEqual(expectedRouteData);
        await expect(
          firstValueFrom(
            componentStore.select({
              parent: ngrxStore.select(
                ngrxRouterStore.selectRouteDataParam('parent')
              ),
              shadowed: ngrxStore.select(
                ngrxRouterStore.selectRouteDataParam('shadowed')
              ),
            })
          )
        ).resolves.toEqual(expectedRouteData);
      });
    });

    describe('And the "always" route parameter inheritance strategy is used', () => {
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
        And route data for the ${GlobalRouterStoreTestChildComponent.name} route is emitted
        And route data for the ${GlobalRouterStoreTestParentComponent.name} route is emitted
        And route data is merged top-down`,
        async ({ RoutedComponent }) => {
          expect.assertions(4);
          const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
            await globalRouterStoreSetup({
              navigateTo: '/parent/child/grandchild',
              paramsInheritanceStrategy: 'always',
              RoutedComponent,
              routes,
            });

          const expectedRouteData: StrictRouteData = {
            parent: 'parent-route-data',
            child: 'child-route-data',
            grandchild: 'grandchild-route-data',
            shadowed: 'grandchild-route-data',
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
                parent: routerStore.selectRouteData('parent'),
                child: routerStore.selectRouteData('child'),
                grandchild: routerStore.selectRouteData('grandchild'),
                shadowed: routerStore.selectRouteData('shadowed'),
              })
            )
          ).resolves.toEqual(expectedRouteData);
          await expect(
            firstValueFrom(
              componentStore.select({
                parent: ngrxStore.select(
                  ngrxRouterStore.selectRouteDataParam('parent')
                ),
                child: ngrxStore.select(
                  ngrxRouterStore.selectRouteDataParam('child')
                ),
                grandchild: ngrxStore.select(
                  ngrxRouterStore.selectRouteDataParam('grandchild')
                ),
                shadowed: ngrxStore.select(
                  ngrxRouterStore.selectRouteDataParam('shadowed')
                ),
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
      Then route data for the ${GlobalRouterStoreTestChildComponent.name} route is emitted
        And route data for the ${GlobalRouterStoreTestParentComponent.name} route is emitted
        And route data is merged top-down`,
        async ({ RoutedComponent }) => {
          expect.assertions(4);
          const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
            await globalRouterStoreSetup({
              navigateTo: '/parent/child',
              paramsInheritanceStrategy: 'always',
              RoutedComponent,
              routes,
            });

          const expectedRouteData: StrictRouteData = {
            parent: 'parent-route-data',
            child: 'child-route-data',
            shadowed: 'child-route-data',
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
                parent: routerStore.selectRouteData('parent'),
                child: routerStore.selectRouteData('child'),
                shadowed: routerStore.selectRouteData('shadowed'),
              })
            )
          ).resolves.toEqual(expectedRouteData);
          await expect(
            firstValueFrom(
              componentStore.select({
                parent: ngrxStore.select(
                  ngrxRouterStore.selectRouteDataParam('parent')
                ),
                child: ngrxStore.select(
                  ngrxRouterStore.selectRouteDataParam('child')
                ),
                shadowed: ngrxStore.select(
                  ngrxRouterStore.selectRouteDataParam('shadowed')
                ),
              })
            )
          ).resolves.toEqual(expectedRouteData);
        }
      );

      it(`And ${RouterStore.name} is injected at ${GlobalRouterStoreTestParentComponent.name}
      When the ${GlobalRouterStoreTestParentComponent.name} route is activated
      Then route data for the ${GlobalRouterStoreTestParentComponent.name} route is emitted`, async () => {
        expect.assertions(4);
        const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
          await globalRouterStoreSetup({
            navigateTo: '/parent',
            paramsInheritanceStrategy: 'always',
            RoutedComponent: GlobalRouterStoreTestParentComponent,
            routes,
          });

        const expectedRouteData: StrictRouteData = {
          parent: 'parent-route-data',
          shadowed: 'parent-route-data',
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
              parent: routerStore.selectRouteData('parent'),
              shadowed: routerStore.selectRouteData('shadowed'),
            })
          )
        ).resolves.toEqual(expectedRouteData);
        await expect(
          firstValueFrom(
            componentStore.select({
              parent: ngrxStore.select(
                ngrxRouterStore.selectRouteDataParam('parent')
              ),
              shadowed: ngrxStore.select(
                ngrxRouterStore.selectRouteDataParam('shadowed')
              ),
            })
          )
        ).resolves.toEqual(expectedRouteData);
      });
    });
  });
});
