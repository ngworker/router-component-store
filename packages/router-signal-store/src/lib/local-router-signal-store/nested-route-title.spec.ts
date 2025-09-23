import { ResolveFn, RouterConfigOptions, Routes } from '@angular/router';
import { RouterSignalStore } from '../router-signal-store';
import { LocalRouterSignalStore } from './local-router-signal-store';
import { localRouterSignalStoreSetup } from './test-util/local-router-signal-store-setup';
import {
  LocalRouterSignalStoreTestChildComponent,
  LocalRouterSignalStoreTestGrandchildComponent,
  LocalRouterSignalStoreTestParentComponent,
} from './test-util/local-router-signal-store-test-components';

const shadowedTitleResolver: ResolveFn<string> = (route) =>
  route.data['shadowed'];

const routes: Routes = [
  {
    path: 'parent',
    component: LocalRouterSignalStoreTestParentComponent,
    data: {
      parent: 'parent-route-data',
      shadowed: 'parent-route-title',
    },
    title: shadowedTitleResolver,
    children: [
      {
        path: 'child',
        component: LocalRouterSignalStoreTestChildComponent,
        data: {
          child: 'child-route-data',
          shadowed: 'child-route-title',
        },
        title: shadowedTitleResolver,
        children: [
          {
            path: 'grandchild',
            component: LocalRouterSignalStoreTestGrandchildComponent,
            data: {
              grandchild: 'grandchild-route-data',
              shadowed: 'grandchild-route-title',
            },
            title: shadowedTitleResolver,
          },
        ],
      },
    ],
  },
];

describe(`${LocalRouterSignalStore.name} nested route title`, () => {
  describe('Given three layers of routes with components and route title resolvers', () => {
    const paramsInheritanceStrategies: RouterConfigOptions['paramsInheritanceStrategy'][] =
      ['always', 'emptyOnly'];

    describe.each(paramsInheritanceStrategies)(
      '  And the "%s" route parameter inheritance strategy is used',
      (paramsInheritanceStrategy) => {
        it.each(['/parent/child/grandchild', '/parent/child', '/parent'])(
          `  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestParentComponent.name}
        When the "%s" route is activated
        Then the route title for the ${LocalRouterSignalStoreTestParentComponent.name} route is emitted`,
          async (navigateTo) => {
            const { routerSignalStore } = await localRouterSignalStoreSetup({
              navigateTo,
              paramsInheritanceStrategy,
              RoutedComponent: LocalRouterSignalStoreTestParentComponent,
              routes,
            });

            const expectedTitle = 'parent-route-title';
            expect(routerSignalStore.title()).toEqual(expectedTitle);
          }
        );
      }
    );

    describe('And the default route parameter inheritance strategy is used', () => {
      it.each(['/parent/child/grandchild', '/parent/child'])(
        `  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestChildComponent.name}
      When the "%s" route is activated
      Then the route title for the ${LocalRouterSignalStoreTestChildComponent.name} route is emitted`,
        async (navigateTo) => {
          const { routerSignalStore } = await localRouterSignalStoreSetup({
            navigateTo,
            RoutedComponent: LocalRouterSignalStoreTestChildComponent,
            routes,
          });

          const expectedTitle = 'child-route-title';
          expect(routerSignalStore.title()).toEqual(expectedTitle);
        }
      );

      it(`  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestGrandchildComponent.name}
      When the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is activated
      Then the route title for the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is emitted`, async () => {
        const { routerSignalStore } = await localRouterSignalStoreSetup({
          navigateTo: '/parent/child/grandchild',
          RoutedComponent: LocalRouterSignalStoreTestGrandchildComponent,
          routes,
        });

        const expectedTitle = 'grandchild-route-title';
        expect(routerSignalStore.title()).toEqual(expectedTitle);
      });
    });

    describe('And the "always" route parameter inheritance strategy is used', () => {
      it.each(['/parent/child/grandchild', '/parent/child'])(
        `  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestChildComponent.name}
      When the "%s" route is activated
      Then the route title for the ${LocalRouterSignalStoreTestChildComponent.name} route is emitted`,
        async (navigateTo) => {
          const { routerSignalStore } = await localRouterSignalStoreSetup({
            navigateTo,
            paramsInheritanceStrategy: 'always',
            RoutedComponent: LocalRouterSignalStoreTestChildComponent,
            routes,
          });

          const expectedTitle = 'child-route-title';
          expect(routerSignalStore.title()).toEqual(expectedTitle);
        }
      );

      it(`  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestGrandchildComponent.name}
      When the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is activated
      Then the route title for the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is emitted`, async () => {
        const { routerSignalStore } = await localRouterSignalStoreSetup({
          navigateTo: '/parent/child/grandchild',
          paramsInheritanceStrategy: 'always',
          RoutedComponent: LocalRouterSignalStoreTestGrandchildComponent,
          routes,
        });

        const expectedTitle = 'grandchild-route-title';
        expect(routerSignalStore.title()).toEqual(expectedTitle);
      });
    });
  });
});
