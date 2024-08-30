import { Params, RouterConfigOptions, Routes } from '@angular/router';
import { firstValueFrom } from 'rxjs';
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
    path: ':parent',
    component: LocalRouterStoreTestParentComponent,
    children: [
      {
        path: ':child',
        component: LocalRouterStoreTestChildComponent,
        children: [
          {
            path: ':grandchild',
            component: LocalRouterStoreTestGrandchildComponent,
          },
        ],
      },
    ],
  },
];

describe(`${LocalRouterStore.name} nested route parameters`, () => {
  describe('Given three layers of routes with components and route parameters', () => {
    const paramsInheritanceStrategies: RouterConfigOptions['paramsInheritanceStrategy'][] =
      ['always', 'emptyOnly'];

    describe.each(paramsInheritanceStrategies)(
      '  And the "%s" route parameter inheritance strategy is used',
      (paramsInheritanceStrategy) => {
        it.each([
          '/parent-route-parameter;shadowed=parent-route-parameter/child-route-parameter;shadowed=child-route-parameter/grandchild-route-parameter;shadowed=grandchild-route-parameter',
          '/parent-route-parameter;shadowed=parent-route-parameter/child-route-parameter;shadowed=child-route-parameter',
          '/parent-route-parameter;shadowed=parent-route-parameter',
        ])(
          `  And ${RouterStore.name} is injected at ${LocalRouterStoreTestParentComponent.name}
        When the "%s" route is activated
        Then route parameters for the ${LocalRouterStoreTestParentComponent.name} route are emitted`,
          async (navigateTo) => {
            expect.assertions(3);
            const { activatedRoute, componentStore, routerStore } =
              await localRouterStoreSetup({
                navigateTo,
                paramsInheritanceStrategy,
                RoutedComponent: LocalRouterStoreTestParentComponent,
                routes,
              });

            const expectedRouteParameters: Params = {
              parent: 'parent-route-parameter',
              shadowed: 'parent-route-parameter',
            };
            await expect(
              firstValueFrom(routerStore.routeParams$)
            ).resolves.toEqual(expectedRouteParameters);
            await expect(
              firstValueFrom(activatedRoute.params)
            ).resolves.toEqual(expectedRouteParameters);
            await expect(
              firstValueFrom(
                componentStore.select({
                  parent: routerStore.selectRouteParam('parent'),
                  shadowed: routerStore.selectRouteParam('shadowed'),
                })
              )
            ).resolves.toEqual(expectedRouteParameters);
          }
        );
      }
    );

    describe('  And the default route parameter inheritance strategy is used', () => {
      it.each([
        '/parent-route-parameter;shadowed=parent-route-parameter/child-route-parameter;shadowed=child-route-parameter/grandchild-route-parameter;shadowed=grandchild-route-parameter',
        '/parent-route-parameter;shadowed=parent-route-parameter/child-route-parameter;shadowed=child-route-parameter',
      ])(
        `  And ${RouterStore.name} is injected at ${LocalRouterStoreTestChildComponent.name}
      When the "%s" route is activated
      Then route parameters for the ${LocalRouterStoreTestChildComponent.name} route are emitted`,
        async (navigateTo) => {
          expect.assertions(3);
          const { activatedRoute, componentStore, routerStore } =
            await localRouterStoreSetup({
              navigateTo,
              RoutedComponent: LocalRouterStoreTestChildComponent,
              routes,
            });

          const expectedRouteParameters: Params = {
            child: 'child-route-parameter',
            shadowed: 'child-route-parameter',
          };
          await expect(
            firstValueFrom(routerStore.routeParams$)
          ).resolves.toEqual(expectedRouteParameters);
          await expect(firstValueFrom(activatedRoute.params)).resolves.toEqual(
            expectedRouteParameters
          );
          await expect(
            firstValueFrom(
              componentStore.select({
                parent: routerStore.selectRouteParam('parent'),
                child: routerStore.selectRouteParam('child'),
                shadowed: routerStore.selectRouteParam('shadowed'),
              })
            )
          ).resolves.toEqual(expectedRouteParameters);
        }
      );

      it(`  And ${RouterStore.name} is injected at ${LocalRouterStoreTestGrandchildComponent.name}
      When the ${LocalRouterStoreTestGrandchildComponent.name} route is activated
      Then route parameters for the ${LocalRouterStoreTestGrandchildComponent.name} route are emitted`, async () => {
        expect.assertions(3);
        const { activatedRoute, componentStore, routerStore } =
          await localRouterStoreSetup({
            navigateTo:
              '/parent-route-parameter;shadowed=parent-route-parameter/child-route-parameter;shadowed=child-route-parameter/grandchild-route-parameter;shadowed=grandchild-route-parameter',
            RoutedComponent: LocalRouterStoreTestGrandchildComponent,
            routes,
          });

        const expectedRouteParameters: Params = {
          grandchild: 'grandchild-route-parameter',
          shadowed: 'grandchild-route-parameter',
        };
        await expect(firstValueFrom(routerStore.routeParams$)).resolves.toEqual(
          expectedRouteParameters
        );
        await expect(firstValueFrom(activatedRoute.params)).resolves.toEqual(
          expectedRouteParameters
        );
        await expect(
          firstValueFrom(
            componentStore.select({
              grandchild: routerStore.selectRouteParam('grandchild'),
              shadowed: routerStore.selectRouteParam('shadowed'),
            })
          )
        ).resolves.toEqual(expectedRouteParameters);
      });
    });
  });

  describe('  And the "always" route parameter inheritance strategy is used', () => {
    it.each([
      '/parent-route-parameter;shadowed=parent-route-parameter/child-route-parameter;shadowed=child-route-parameter/grandchild-route-parameter;shadowed=grandchild-route-parameter',
      '/parent-route-parameter;shadowed=parent-route-parameter/child-route-parameter;shadowed=child-route-parameter',
    ])(
      `  And ${RouterStore.name} is injected at ${LocalRouterStoreTestChildComponent.name}
    When the "%s" route is activated
    Then route parameters for the ${LocalRouterStoreTestChildComponent.name} route are emitted
      And route parameters for the ${LocalRouterStoreTestParentComponent.name} route are emitted
      And route parameters are merged top-down`,
      async (navigateTo) => {
        expect.assertions(3);
        const { activatedRoute, componentStore, routerStore } =
          await localRouterStoreSetup({
            paramsInheritanceStrategy: 'always',
            navigateTo,
            RoutedComponent: LocalRouterStoreTestChildComponent,
            routes,
          });

        const expectedRouteParameters: Params = {
          parent: 'parent-route-parameter',
          child: 'child-route-parameter',
          shadowed: 'child-route-parameter',
        };
        await expect(firstValueFrom(routerStore.routeParams$)).resolves.toEqual(
          expectedRouteParameters
        );
        await expect(firstValueFrom(activatedRoute.params)).resolves.toEqual(
          expectedRouteParameters
        );
        await expect(
          firstValueFrom(
            componentStore.select({
              parent: routerStore.selectRouteParam('parent'),
              child: routerStore.selectRouteParam('child'),
              shadowed: routerStore.selectRouteParam('shadowed'),
            })
          )
        ).resolves.toEqual(expectedRouteParameters);
      }
    );

    it(`  And ${RouterStore.name} is injected at ${LocalRouterStoreTestGrandchildComponent.name}
    When the ${LocalRouterStoreTestGrandchildComponent.name} route is activated
    Then route parameters for the ${LocalRouterStoreTestGrandchildComponent.name} route are emitted
      And route parameters for the ${LocalRouterStoreTestChildComponent.name} route are emitted
      And route paraemters for the ${LocalRouterStoreTestParentComponent.name} route are emitted
      And route parameters are merged top-down`, async () => {
      expect.assertions(3);
      const { activatedRoute, componentStore, routerStore } =
        await localRouterStoreSetup({
          paramsInheritanceStrategy: 'always',
          navigateTo:
            '/parent-route-parameter;shadowed=parent-route-parameter/child-route-parameter;shadowed=child-route-parameter/grandchild-route-parameter;shadowed=grandchild-route-parameter',
          RoutedComponent: LocalRouterStoreTestGrandchildComponent,
          routes,
        });

      const expectedRouteParameters: Params = {
        parent: 'parent-route-parameter',
        child: 'child-route-parameter',
        grandchild: 'grandchild-route-parameter',
        shadowed: 'grandchild-route-parameter',
      };
      await expect(firstValueFrom(routerStore.routeParams$)).resolves.toEqual(
        expectedRouteParameters
      );
      await expect(firstValueFrom(activatedRoute.params)).resolves.toEqual(
        expectedRouteParameters
      );
      await expect(
        firstValueFrom(
          componentStore.select({
            parent: routerStore.selectRouteParam('parent'),
            child: routerStore.selectRouteParam('child'),
            grandchild: routerStore.selectRouteParam('grandchild'),
            shadowed: routerStore.selectRouteParam('shadowed'),
          })
        )
      ).resolves.toEqual(expectedRouteParameters);
    });
  });
});
