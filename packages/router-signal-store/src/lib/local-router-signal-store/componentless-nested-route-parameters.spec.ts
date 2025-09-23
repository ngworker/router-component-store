import { computed } from '@angular/core';
import { Params, RouterConfigOptions, Routes } from '@angular/router';
import { RouterSignalStore } from '../router-signal-store';
import { LocalRouterSignalStore } from './local-router-signal-store';
import { localRouterSignalStoreSetup } from './test-util/local-router-signal-store-setup';
import {
  LocalRouterSignalStoreTestChildComponent,
  LocalRouterSignalStoreTestGrandchildComponent,
  LocalRouterSignalStoreTestParentComponent,
} from './test-util/local-router-signal-store-test-components';

const routes: Routes = [
  {
    path: ':componentlessBeforeParent',
    children: [
      {
        path: ':parent',
        component: LocalRouterSignalStoreTestParentComponent,
        children: [
          {
            path: ':componentlessBeforeChild',
            children: [
              {
                path: ':child',
                component: LocalRouterSignalStoreTestChildComponent,
                children: [
                  {
                    path: ':componentlessBeforeGrandchild',
                    children: [
                      {
                        path: ':grandchild',
                        component:
                          LocalRouterSignalStoreTestGrandchildComponent,
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

describe(`${LocalRouterSignalStore.name} componentless nested route parameters`, () => {
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
          `  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestParentComponent.name}
        When the "%s" route is activated
        Then route parameters for the ${LocalRouterSignalStoreTestParentComponent.name} route are emitted
          And componentless route parameters before the ${LocalRouterSignalStoreTestParentComponent.name} are emitted`,
          async (navigateTo) => {
            const { activatedRoute, routerSignalStore, toSignal } =
              await localRouterSignalStoreSetup({
                navigateTo,
                paramsInheritanceStrategy,
                RoutedComponent: LocalRouterSignalStoreTestParentComponent,
                routes,
              });

            const expectedRouteParameters: Params = {
              componentlessBeforeParent:
                'componentless-route-parameter-before-parent',
              parent: 'parent-route-parameter',
              shadowed: 'parent-route-parameter',
            };
            expect(routerSignalStore.routeParams()).toEqual(
              expectedRouteParameters
            );
            expect(toSignal(activatedRoute.params)()).toEqual(
              expectedRouteParameters
            );
            const actualRouteParameters = computed(() => ({
              componentlessBeforeParent: routerSignalStore.selectRouteParam(
                'componentlessBeforeParent'
              )(),
              parent: routerSignalStore.selectRouteParam('parent')(),
              shadowed: routerSignalStore.selectRouteParam('shadowed')(),
            }));
            expect(actualRouteParameters()).toEqual(expectedRouteParameters);
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
      `  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestChildComponent.name}
    When the "%s" route is activated
    Then route parameters for the ${LocalRouterSignalStoreTestChildComponent.name} route are emitted
      And componentless route parameters before the ${LocalRouterSignalStoreTestChildComponent.name} are emitted`,
      async (navigateTo) => {
        const { activatedRoute, routerSignalStore, toSignal } =
          await localRouterSignalStoreSetup({
            navigateTo,
            RoutedComponent: LocalRouterSignalStoreTestChildComponent,
            routes,
          });

        const expectedRouteParameters: Params = {
          componentlessBeforeChild:
            'componentless-route-parameter-before-child',
          child: 'child-route-parameter',
          shadowed: 'child-route-parameter',
        };
        expect(routerSignalStore.routeParams()).toEqual(
          expectedRouteParameters
        );
        expect(toSignal(activatedRoute.params)()).toEqual(
          expectedRouteParameters
        );
        const actualRouteParameters = computed(() => ({
          componentlessBeforeChild: routerSignalStore.selectRouteParam(
            'componentlessBeforeChild'
          )(),
          child: routerSignalStore.selectRouteParam('child')(),
          shadowed: routerSignalStore.selectRouteParam('shadowed')(),
        }));
        expect(actualRouteParameters()).toEqual(expectedRouteParameters);
      }
    );

    it(`  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestGrandchildComponent.name}
    When the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is activated
    Then route parameters for the ${LocalRouterSignalStoreTestGrandchildComponent.name} route are emitted
      And componentless route parameters before the ${LocalRouterSignalStoreTestGrandchildComponent.name} are emitted`, async () => {
      const { activatedRoute, routerSignalStore, toSignal } =
        await localRouterSignalStoreSetup({
          navigateTo:
            'componentless-route-parameter-before-parent;shadowed=componentless-route-parameter-before-parent/parent-route-parameter;shadowed=parent-route-parameter/componentless-route-parameter-before-child;shadowed=componentless-route-parameter-before-child/child-route-parameter;shadowed=child-route-parameter/componentless-route-parameter-before-grandchild;shadowed=componentless-route-parameter-before-grandchild/grandchild-route-parameter;shadowed=grandchild-route-parameter',
          RoutedComponent: LocalRouterSignalStoreTestGrandchildComponent,
          routes,
        });

      const expectedRouteParameters: Params = {
        componentlessBeforeGrandchild:
          'componentless-route-parameter-before-grandchild',
        grandchild: 'grandchild-route-parameter',
        shadowed: 'grandchild-route-parameter',
      };
      expect(routerSignalStore.routeParams()).toEqual(expectedRouteParameters);
      expect(toSignal(activatedRoute.params)()).toEqual(
        expectedRouteParameters
      );
      const actualRouteParameters = computed(() => ({
        componentlessBeforeGrandchild: routerSignalStore.selectRouteParam(
          'componentlessBeforeGrandchild'
        )(),
        grandchild: routerSignalStore.selectRouteParam('grandchild')(),
        shadowed: routerSignalStore.selectRouteParam('shadowed')(),
      }));
      expect(actualRouteParameters()).toEqual(expectedRouteParameters);
    });
  });

  describe('  And the "always" route parameter inheritance strategy is used', () => {
    it.each([
      'componentless-route-parameter-before-parent;shadowed=componentless-route-parameter-before-parent/parent-route-parameter;shadowed=parent-route-parameter/componentless-route-parameter-before-child;shadowed=componentless-route-parameter-before-child/child-route-parameter;shadowed=child-route-parameter/componentless-route-parameter-before-grandchild;shadowed=componentless-route-parameter-before-grandchild/grandchild-route-parameter;shadowed=grandchild-route-parameter',
      'componentless-route-parameter-before-parent;shadowed=componentless-route-parameter-before-parent/parent-route-parameter;shadowed=parent-route-parameter/componentless-route-parameter-before-child;shadowed=componentless-route-parameter-before-child/child-route-parameter;shadowed=child-route-parameter',
    ])(
      `  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestChildComponent.name}
    When the "%s" route is activated
    Then route parameters for the ${LocalRouterSignalStoreTestChildComponent.name} route are emitted
      And componentless route parameters before the ${LocalRouterSignalStoreTestChildComponent.name} are emitted
      And route parameters for the ${LocalRouterSignalStoreTestParentComponent.name} route are emitted
      And componentless route parameters before the ${LocalRouterSignalStoreTestParentComponent.name} are emitted`,
      async (navigateTo) => {
        const { routerSignalStore } = await localRouterSignalStoreSetup({
          navigateTo,
          paramsInheritanceStrategy: 'always',
          RoutedComponent: LocalRouterSignalStoreTestChildComponent,
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
        expect(routerSignalStore.routeParams()).toEqual(
          expectedRouteParameters
        );
        const actualRouteParameters = computed(() => ({
          componentlessBeforeParent: routerSignalStore.selectRouteParam(
            'componentlessBeforeParent'
          )(),
          parent: routerSignalStore.selectRouteParam('parent')(),
          componentlessBeforeChild: routerSignalStore.selectRouteParam(
            'componentlessBeforeChild'
          )(),
          child: routerSignalStore.selectRouteParam('child')(),
          shadowed: routerSignalStore.selectRouteParam('shadowed')(),
        }));
        expect(actualRouteParameters()).toEqual(expectedRouteParameters);
      }
    );

    it(`  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestGrandchildComponent.name}
    When the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is activated
    Then route parameters for the ${LocalRouterSignalStoreTestGrandchildComponent.name} route are emitted
      And componentless route parameters before the ${LocalRouterSignalStoreTestGrandchildComponent.name} are emitted
      And route parameters for the ${LocalRouterSignalStoreTestChildComponent.name} route are emitted
      And componentless route parameters before the ${LocalRouterSignalStoreTestChildComponent.name} are emitted
      And route parameters for the ${LocalRouterSignalStoreTestParentComponent.name} route are emitted
      And componentless route parameters before the ${LocalRouterSignalStoreTestParentComponent.name} are emitted`, async () => {
      const { routerSignalStore } = await localRouterSignalStoreSetup({
        navigateTo:
          'componentless-route-parameter-before-parent;shadowed=componentless-route-parameter-before-parent/parent-route-parameter;shadowed=parent-route-parameter/componentless-route-parameter-before-child;shadowed=componentless-route-parameter-before-child/child-route-parameter;shadowed=child-route-parameter/componentless-route-parameter-before-grandchild;shadowed=componentless-route-parameter-before-grandchild/grandchild-route-parameter;shadowed=grandchild-route-parameter',
        paramsInheritanceStrategy: 'always',
        RoutedComponent: LocalRouterSignalStoreTestGrandchildComponent,
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
      expect(routerSignalStore.routeParams()).toEqual(expectedRouteParameters);
      const actualRouteParameters = computed(() => ({
        componentlessBeforeParent: routerSignalStore.selectRouteParam(
          'componentlessBeforeParent'
        )(),
        parent: routerSignalStore.selectRouteParam('parent')(),
        componentlessBeforeChild: routerSignalStore.selectRouteParam(
          'componentlessBeforeChild'
        )(),
        child: routerSignalStore.selectRouteParam('child')(),
        componentlessBeforeGrandchild: routerSignalStore.selectRouteParam(
          'componentlessBeforeGrandchild'
        )(),
        grandchild: routerSignalStore.selectRouteParam('grandchild')(),
        shadowed: routerSignalStore.selectRouteParam('shadowed')(),
      }));
      expect(actualRouteParameters()).toEqual(expectedRouteParameters);
    });
  });
});
