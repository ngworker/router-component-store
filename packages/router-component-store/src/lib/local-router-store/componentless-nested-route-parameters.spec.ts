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
    path: ':componentlessBeforeParent',
    children: [
      {
        path: ':parent',
        component: LocalRouterStoreTestParentComponent,
        children: [
          {
            path: ':componentlessBeforeChild',
            children: [
              {
                path: ':child',
                component: LocalRouterStoreTestChildComponent,
                children: [
                  {
                    path: ':componentlessBeforeGrandchild',
                    children: [
                      {
                        path: ':grandchild',
                        component: LocalRouterStoreTestGrandchildComponent,
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

describe(`${LocalRouterStore.name} componentless nested route parameters`, () => {
  describe(`Given three layers of routes with components and route parameters
    And a componentless route with route parameters before each of them`, () => {
    const paramsInheritanceStrategies: RouterConfigOptions['paramsInheritanceStrategy'][] =
      ['always', 'emptyOnly'];

    describe.each(paramsInheritanceStrategies)(
      '  And the "%s" route parameter inheritance strategy is used',
      (paramsInheritanceStrategy) => {
        it.each([
          'componentless-route-parameter-before-parent;shadowed=componentless-route-parameter-before-parent/parent-route-parameter;shadowed=parent-route-parameter/componentless-route-parameter-before-child;shadowed=componentless-route-parameter-before-child/child-route-parameter;shadowed=child-route-parameter/componentless-route-parameter-before-grandchild;shadowed=componentless-route-parameter-before-grandchild/grandchild-route-parameter;shadowed=grandchild-route-parameter',
          'componentless-route-parameter-before-parent;shadowed=componentless-route-parameter-before-parent/parent-route-parameter;shadowed=parent-route-parameter/componentless-route-parameter-before-child;shadowed=componentless-route-parameter-before-child/child-route-parameter;shadowed=child-route-parameter',
          'componentless-route-parameter-before-parent;shadowed=componentless-route-parameter-before-parent/parent-route-parameter;shadowed=parent-route-parameter',
        ])(
          `  And ${RouterStore.name} is injected at ${LocalRouterStoreTestParentComponent.name}
        When the "%s" route is activated
        Then route parameters for the ${LocalRouterStoreTestParentComponent.name} route are emitted
          And componentless route parameters before the ${LocalRouterStoreTestParentComponent.name} are emitted`,
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
              componentlessBeforeParent:
                'componentless-route-parameter-before-parent',
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
                  componentlessBeforeParent: routerStore.selectRouteParam(
                    'componentlessBeforeParent'
                  ),
                  parent: routerStore.selectRouteParam('parent'),
                  shadowed: routerStore.selectRouteParam('shadowed'),
                })
              )
            ).resolves.toEqual(expectedRouteParameters);
          }
        );
      }
    );
  });

  describe('  And the default route parameter inheritance strategy is used', () => {
    it.each([
      'componentless-route-parameter-before-parent;shadowed=componentless-route-parameter-before-parent/parent-route-parameter;shadowed=parent-route-parameter/componentless-route-parameter-before-child;shadowed=componentless-route-parameter-before-child/child-route-parameter;shadowed=child-route-parameter/componentless-route-parameter-before-grandchild;shadowed=componentless-route-parameter-before-grandchild/grandchild-route-parameter;shadowed=grandchild-route-parameter',
      'componentless-route-parameter-before-parent;shadowed=componentless-route-parameter-before-parent/parent-route-parameter;shadowed=parent-route-parameter/componentless-route-parameter-before-child;shadowed=componentless-route-parameter-before-child/child-route-parameter;shadowed=child-route-parameter',
    ])(
      `  And ${RouterStore.name} is injected at ${LocalRouterStoreTestChildComponent.name}
    When the "%s" route is activated
    Then route parameters for the ${LocalRouterStoreTestChildComponent.name} route are emitted
      And componentless route parameters before the ${LocalRouterStoreTestChildComponent.name} are emitted`,
      async (navigateTo) => {
        expect.assertions(3);
        const { activatedRoute, componentStore, routerStore } =
          await localRouterStoreSetup({
            navigateTo,
            RoutedComponent: LocalRouterStoreTestChildComponent,
            routes,
          });

        const expectedRouteParameters: Params = {
          componentlessBeforeChild:
            'componentless-route-parameter-before-child',
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
              componentlessBeforeChild: routerStore.selectRouteParam(
                'componentlessBeforeChild'
              ),
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
      And componentless route parameters before the ${LocalRouterStoreTestGrandchildComponent.name} are emitted`, async () => {
      expect.assertions(3);
      const { activatedRoute, componentStore, routerStore } =
        await localRouterStoreSetup({
          navigateTo:
            'componentless-route-parameter-before-parent;shadowed=componentless-route-parameter-before-parent/parent-route-parameter;shadowed=parent-route-parameter/componentless-route-parameter-before-child;shadowed=componentless-route-parameter-before-child/child-route-parameter;shadowed=child-route-parameter/componentless-route-parameter-before-grandchild;shadowed=componentless-route-parameter-before-grandchild/grandchild-route-parameter;shadowed=grandchild-route-parameter',
          RoutedComponent: LocalRouterStoreTestGrandchildComponent,
          routes,
        });

      const expectedRouteParameters: Params = {
        componentlessBeforeGrandchild:
          'componentless-route-parameter-before-grandchild',
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
            componentlessBeforeGrandchild: routerStore.selectRouteParam(
              'componentlessBeforeGrandchild'
            ),
            grandchild: routerStore.selectRouteParam('grandchild'),
            shadowed: routerStore.selectRouteParam('shadowed'),
          })
        )
      ).resolves.toEqual(expectedRouteParameters);
    });
  });

  describe('  And the "always" route parameter inheritance strategy is used', () => {
    it.each([
      'componentless-route-parameter-before-parent;shadowed=componentless-route-parameter-before-parent/parent-route-parameter;shadowed=parent-route-parameter/componentless-route-parameter-before-child;shadowed=componentless-route-parameter-before-child/child-route-parameter;shadowed=child-route-parameter/componentless-route-parameter-before-grandchild;shadowed=componentless-route-parameter-before-grandchild/grandchild-route-parameter;shadowed=grandchild-route-parameter',
      'componentless-route-parameter-before-parent;shadowed=componentless-route-parameter-before-parent/parent-route-parameter;shadowed=parent-route-parameter/componentless-route-parameter-before-child;shadowed=componentless-route-parameter-before-child/child-route-parameter;shadowed=child-route-parameter',
    ])(
      `  And ${RouterStore.name} is injected at ${LocalRouterStoreTestChildComponent.name}
    When the "%s" route is activated
    Then route parameters for the ${LocalRouterStoreTestChildComponent.name} route are emitted
      And componentless route parameters before the ${LocalRouterStoreTestChildComponent.name} are emitted
      And route parameters for the ${LocalRouterStoreTestParentComponent.name} route are emitted
      And componentless route parameters before the ${LocalRouterStoreTestParentComponent.name} are emitted`,
      async (navigateTo) => {
        expect.assertions(3);
        const { activatedRoute, componentStore, routerStore } =
          await localRouterStoreSetup({
            navigateTo,
            paramsInheritanceStrategy: 'always',
            RoutedComponent: LocalRouterStoreTestChildComponent,
            routes,
          });

        const expectedRouteParameters: Params = {
          componentlessBeforeParent:
            'componentless-route-parameter-before-parent',
          parent: 'parent-route-parameter',
          componentlessBeforeChild:
            'componentless-route-parameter-before-child',
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
              componentlessBeforeParent: routerStore.selectRouteParam(
                'componentlessBeforeParent'
              ),
              parent: routerStore.selectRouteParam('parent'),
              componentlessBeforeChild: routerStore.selectRouteParam(
                'componentlessBeforeChild'
              ),
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
      And componentless route parameters before the ${LocalRouterStoreTestGrandchildComponent.name} are emitted
      And route parameters for the ${LocalRouterStoreTestChildComponent.name} route are emitted
      And componentless route parameters before the ${LocalRouterStoreTestChildComponent.name} are emitted
      And route parameters for the ${LocalRouterStoreTestParentComponent.name} route are emitted
      And componentless route parameters before the ${LocalRouterStoreTestParentComponent.name} are emitted`, async () => {
      expect.assertions(3);
      const { activatedRoute, componentStore, routerStore } =
        await localRouterStoreSetup({
          navigateTo:
            'componentless-route-parameter-before-parent;shadowed=componentless-route-parameter-before-parent/parent-route-parameter;shadowed=parent-route-parameter/componentless-route-parameter-before-child;shadowed=componentless-route-parameter-before-child/child-route-parameter;shadowed=child-route-parameter/componentless-route-parameter-before-grandchild;shadowed=componentless-route-parameter-before-grandchild/grandchild-route-parameter;shadowed=grandchild-route-parameter',
          paramsInheritanceStrategy: 'always',
          RoutedComponent: LocalRouterStoreTestGrandchildComponent,
          routes,
        });

      const expectedRouteParameters: Params = {
        componentlessBeforeParent:
          'componentless-route-parameter-before-parent',
        parent: 'parent-route-parameter',
        componentlessBeforeChild: 'componentless-route-parameter-before-child',
        child: 'child-route-parameter',
        componentlessBeforeGrandchild:
          'componentless-route-parameter-before-grandchild',
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
            componentlessBeforeParent: routerStore.selectRouteParam(
              'componentlessBeforeParent'
            ),
            parent: routerStore.selectRouteParam('parent'),
            componentlessBeforeChild: routerStore.selectRouteParam(
              'componentlessBeforeChild'
            ),
            child: routerStore.selectRouteParam('child'),
            componentlessBeforeGrandchild: routerStore.selectRouteParam(
              'componentlessBeforeGrandchild'
            ),
            grandchild: routerStore.selectRouteParam('grandchild'),
            shadowed: routerStore.selectRouteParam('shadowed'),
          })
        )
      ).resolves.toEqual(expectedRouteParameters);
    });
  });
});
