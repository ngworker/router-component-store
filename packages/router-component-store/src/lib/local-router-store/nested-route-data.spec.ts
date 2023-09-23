import { RouterConfigOptions, Routes } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MinimalRouteData } from '../minimal-route-data';
import { RouterStore } from '../router-store';
import { LocalRouterStore } from './local-router-store';
import { localRouterStoreSetup } from './test-util/local-router-store-setup';
import {
  LocalRouterStoreTestChildComponent,
  LocalRouterStoreTestGrandchildComponent,
  LocalRouterStoreTestParentComponent,
} from './test-util/local-router-store-test-components';

const routes: Routes = [
  {
    path: 'parent',
    component: LocalRouterStoreTestParentComponent,
    data: {
      parent: 'parent-route-data',
      shadowed: 'parent-route-data',
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
];

describe(`${LocalRouterStore.name} nested route data`, () => {
  describe('Given three layers of routes with components and route data', () => {
    const paramsInheritanceStrategies: RouterConfigOptions['paramsInheritanceStrategy'][] =
      ['always', 'emptyOnly'];

    describe.each(paramsInheritanceStrategies)(
      '  And the "%s" route parameter inheritance strategy is used',
      (paramsInheritanceStrategy) => {
        it.each(['/parent/child/grandchild', '/parent/child', '/parent'])(
          `  And ${RouterStore.name} is injected at ${LocalRouterStoreTestParentComponent.name}
        When the "%s" route is activated
        Then route data for the ${LocalRouterStoreTestParentComponent.name} route is emitted`,
          async (navigateTo) => {
            expect.assertions(3);
            const { activatedRoute, componentStore, routerStore } =
              await localRouterStoreSetup({
                navigateTo,
                paramsInheritanceStrategy,
                RoutedComponent: LocalRouterStoreTestParentComponent,
                routes,
              });

            const expectedRouteData: MinimalRouteData = {
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
                  parent: routerStore.selectRouteData('parent'),
                  shadowed: routerStore.selectRouteData('shadowed'),
                })
              )
            ).resolves.toEqual(expectedRouteData);
          }
        );
      }
    );

    describe('And the default route parameter inheritance strategy is used', () => {
      it.each(['/parent/child/grandchild', '/parent/child'])(
        `  And ${RouterStore.name} is injected at ${LocalRouterStoreTestChildComponent.name}
      When the "%s" route is activated
      Then route data for the ${LocalRouterStoreTestChildComponent.name} route is emitted`,
        async (navigateTo) => {
          expect.assertions(3);
          const { activatedRoute, componentStore, routerStore } =
            await localRouterStoreSetup({
              navigateTo,
              RoutedComponent: LocalRouterStoreTestChildComponent,
              routes,
            });

          const expectedRouteData: MinimalRouteData = {
            child: 'child-route-data',
            shadowed: 'child-route-data',
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
                child: routerStore.selectRouteData('child'),
                shadowed: routerStore.selectRouteData('shadowed'),
              })
            )
          ).resolves.toEqual(expectedRouteData);
        }
      );

      it(`  And ${RouterStore.name} is injected at ${LocalRouterStoreTestGrandchildComponent.name}
      When the ${LocalRouterStoreTestGrandchildComponent.name} route is activated
      Then route data for the ${LocalRouterStoreTestGrandchildComponent.name} route is emitted`, async () => {
        expect.assertions(3);
        const { activatedRoute, componentStore, routerStore } =
          await localRouterStoreSetup({
            navigateTo: '/parent/child/grandchild',
            RoutedComponent: LocalRouterStoreTestGrandchildComponent,
            routes,
          });

        const expectedRouteData: MinimalRouteData = {
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
              grandchild: routerStore.selectRouteData('grandchild'),
              shadowed: routerStore.selectRouteData('shadowed'),
            })
          )
        ).resolves.toEqual(expectedRouteData);
      });
    });

    describe('And the "always" route parameter inheritance strategy is used', () => {
      it.each(['/parent/child/grandchild', '/parent/child'])(
        `  And ${RouterStore.name} is injected at ${LocalRouterStoreTestChildComponent.name}
      When the "%s" route is activated
      Then route data for the ${LocalRouterStoreTestChildComponent.name} route is emitted
        And route data for the ${LocalRouterStoreTestParentComponent.name} route is emitted
        And route data is merged top-down`,
        async (navigateTo) => {
          expect.assertions(3);
          const { activatedRoute, componentStore, routerStore } =
            await localRouterStoreSetup({
              navigateTo,
              paramsInheritanceStrategy: 'always',
              RoutedComponent: LocalRouterStoreTestChildComponent,
              routes,
            });

          const expectedRouteData: MinimalRouteData = {
            parent: 'parent-route-data',
            child: 'child-route-data',
            shadowed: 'child-route-data',
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
                parent: routerStore.selectRouteData('parent'),
                child: routerStore.selectRouteData('child'),
                shadowed: routerStore.selectRouteData('shadowed'),
              })
            )
          ).resolves.toEqual(expectedRouteData);
        }
      );

      it(`  And ${RouterStore.name} is injected at ${LocalRouterStoreTestGrandchildComponent.name}
      When the ${LocalRouterStoreTestGrandchildComponent.name} route is activated
      Then route data for the ${LocalRouterStoreTestGrandchildComponent.name} route is emitted
        And route data for the ${LocalRouterStoreTestChildComponent.name} route is emitted
        And route data for the ${LocalRouterStoreTestParentComponent.name} route is emitted
        And route data is merged top-down`, async () => {
        expect.assertions(3);
        const { activatedRoute, componentStore, routerStore } =
          await localRouterStoreSetup({
            navigateTo: '/parent/child/grandchild',
            paramsInheritanceStrategy: 'always',
            RoutedComponent: LocalRouterStoreTestGrandchildComponent,
            routes,
          });

        const expectedRouteData: MinimalRouteData = {
          parent: 'parent-route-data',
          child: 'child-route-data',
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
              parent: routerStore.selectRouteData('parent'),
              child: routerStore.selectRouteData('child'),
              grandchild: routerStore.selectRouteData('grandchild'),
              shadowed: routerStore.selectRouteData('shadowed'),
            })
          )
        ).resolves.toEqual(expectedRouteData);
      });
    });
  });
});
