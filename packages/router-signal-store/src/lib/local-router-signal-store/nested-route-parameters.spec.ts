import { Params, RouterConfigOptions, Routes } from '@angular/router';
import { RouterSignalStore } from '../router-signal-store';
import { LocalRouterSignalStore } from './local-router-signal-store';
import { localRouterSignalStoreSetup } from './test-util/local-router-signal-store-setup';
import {
  LocalRouterSignalStoreTestChildComponent,
  LocalRouterSignalStoreTestGrandchildComponent,
  LocalRouterSignalStoreTestParentComponent,
} from './test-util/local-router-signal-store-test-components';
import { computed } from '@angular/core';

const routes: Routes = [
  {
    path: ':parent',
    component: LocalRouterSignalStoreTestParentComponent,
    children: [
      {
        path: ':child',
        component: LocalRouterSignalStoreTestChildComponent,
        children: [
          {
            path: ':grandchild',
            component: LocalRouterSignalStoreTestGrandchildComponent,
          },
        ],
      },
    ],
  },
];

describe(`${LocalRouterSignalStore.name} nested route parameters`, () => {
  describe('Given three layers of routes with route parameters', () => {
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
          `  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestParentComponent.name}
        When the "%s" route is activated
        Then route parameters for the ${LocalRouterSignalStoreTestParentComponent.name} route are emitted`,
          async (navigateTo) => {
            const { activatedRoute, routerSignalStore, toSignal } =
              await localRouterSignalStoreSetup({
                navigateTo,
                paramsInheritanceStrategy,
                RoutedComponent: LocalRouterSignalStoreTestParentComponent,
                routes,
              });

            const expectedRouteParameters: Params = {
              parent: 'parent-route-parameter',
              shadowed: 'parent-route-parameter',
            };
            expect(routerSignalStore.routeParams()).toEqual(
              expectedRouteParameters
            );
            expect(toSignal(activatedRoute.params)()).toEqual(
              expectedRouteParameters
            );
            const actualRouteData = computed(() => ({
              parent: routerSignalStore.selectRouteParam('parent')(),
              shadowed: routerSignalStore.selectRouteParam('shadowed')(),
            }));
            expect(actualRouteData()).toEqual(expectedRouteParameters);
          }
        );
      }
    );

    describe('  And the default route parameter inheritance strategy is used', () => {
      it.each([
        '/parent-route-parameter;shadowed=parent-route-parameter/child-route-parameter;shadowed=child-route-parameter/grandchild-route-parameter;shadowed=grandchild-route-parameter',
        '/parent-route-parameter;shadowed=parent-route-parameter/child-route-parameter;shadowed=child-route-parameter',
      ])(
        `  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestChildComponent.name}
      When the "%s" route is activated
      Then route parameters for the ${LocalRouterSignalStoreTestChildComponent.name} route are emitted`,
        async (navigateTo) => {
          const { activatedRoute, routerSignalStore, toSignal } =
            await localRouterSignalStoreSetup({
              navigateTo,
              RoutedComponent: LocalRouterSignalStoreTestChildComponent,
              routes,
            });

          const expectedRouteParameters: Params = {
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
            parent: routerSignalStore.selectRouteParam('parent')(),
            child: routerSignalStore.selectRouteParam('child')(),
            shadowed: routerSignalStore.selectRouteParam('shadowed')(),
          }));
          expect(actualRouteParameters()).toEqual(expectedRouteParameters);
        }
      );

      it(`  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestGrandchildComponent.name}
      When the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is activated
      Then route parameters for the ${LocalRouterSignalStoreTestGrandchildComponent.name} route are emitted`, async () => {
        const { activatedRoute, routerSignalStore, toSignal } =
          await localRouterSignalStoreSetup({
            navigateTo:
              '/parent-route-parameter;shadowed=parent-route-parameter/child-route-parameter;shadowed=child-route-parameter/grandchild-route-parameter;shadowed=grandchild-route-parameter',
            RoutedComponent: LocalRouterSignalStoreTestGrandchildComponent,
            routes,
          });

        const expectedRouteParameters: Params = {
          grandchild: 'grandchild-route-parameter',
          shadowed: 'grandchild-route-parameter',
        };
        expect(routerSignalStore.routeParams()).toEqual(
          expectedRouteParameters
        );
        expect(toSignal(activatedRoute.params)()).toEqual(
          expectedRouteParameters
        );
        const actualRouteParameters = computed(() => ({
          grandchild: routerSignalStore.selectRouteParam('grandchild')(),
          shadowed: routerSignalStore.selectRouteParam('shadowed')(),
        }));
        expect(actualRouteParameters()).toEqual(expectedRouteParameters);
      });
    });
  });

  describe('  And the "always" route parameter inheritance strategy is used', () => {
    it.each([
      '/parent-route-parameter;shadowed=parent-route-parameter/child-route-parameter;shadowed=child-route-parameter/grandchild-route-parameter;shadowed=grandchild-route-parameter',
      '/parent-route-parameter;shadowed=parent-route-parameter/child-route-parameter;shadowed=child-route-parameter',
    ])(
      `  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestChildComponent.name}
    When the "%s" route is activated
    Then route parameters for the ${LocalRouterSignalStoreTestChildComponent.name} route are emitted
      And route parameters for the ${LocalRouterSignalStoreTestParentComponent.name} route are emitted
      And route parameters are merged top-down`,
      async (navigateTo) => {
        const { activatedRoute, routerSignalStore, toSignal } =
          await localRouterSignalStoreSetup({
            paramsInheritanceStrategy: 'always',
            navigateTo,
            RoutedComponent: LocalRouterSignalStoreTestChildComponent,
            routes,
          });

        const expectedRouteParameters: Params = {
          parent: 'parent-route-parameter',
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
          parent: routerSignalStore.selectRouteParam('parent')(),
          child: routerSignalStore.selectRouteParam('child')(),
          shadowed: routerSignalStore.selectRouteParam('shadowed')(),
        }));
        expect(actualRouteParameters()).toEqual(expectedRouteParameters);
      }
    );

    it(`  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestGrandchildComponent.name}
    When the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is activated
    Then route parameters for the ${LocalRouterSignalStoreTestGrandchildComponent.name} route are emitted
      And route parameters for the ${LocalRouterSignalStoreTestChildComponent.name} route are emitted
      And route parameters for the ${LocalRouterSignalStoreTestParentComponent.name} route are emitted
      And route parameters are merged top-down`, async () => {
      const { activatedRoute, routerSignalStore, toSignal } =
        await localRouterSignalStoreSetup({
          paramsInheritanceStrategy: 'always',
          navigateTo:
            '/parent-route-parameter;shadowed=parent-route-parameter/child-route-parameter;shadowed=child-route-parameter/grandchild-route-parameter;shadowed=grandchild-route-parameter',
          RoutedComponent: LocalRouterSignalStoreTestGrandchildComponent,
          routes,
        });

      const expectedRouteParameters: Params = {
        parent: 'parent-route-parameter',
        child: 'child-route-parameter',
        grandchild: 'grandchild-route-parameter',
        shadowed: 'grandchild-route-parameter',
      };
      expect(routerSignalStore.routeParams()).toEqual(expectedRouteParameters);
      expect(toSignal(activatedRoute.params)()).toEqual(
        expectedRouteParameters
      );
      const actualRouteParameters = computed(() => ({
        parent: routerSignalStore.selectRouteParam('parent')(),
        child: routerSignalStore.selectRouteParam('child')(),
        grandchild: routerSignalStore.selectRouteParam('grandchild')(),
        shadowed: routerSignalStore.selectRouteParam('shadowed')(),
      }));
      expect(actualRouteParameters()).toEqual(expectedRouteParameters);
    });
  });
});
