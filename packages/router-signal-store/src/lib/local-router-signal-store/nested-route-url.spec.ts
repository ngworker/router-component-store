import { RouterConfigOptions, Routes } from '@angular/router';
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
    path: 'parent',
    component: LocalRouterSignalStoreTestParentComponent,
    children: [
      {
        path: 'child',
        component: LocalRouterSignalStoreTestChildComponent,
        children: [
          {
            path: 'grandchild',
            component: LocalRouterSignalStoreTestGrandchildComponent,
          },
        ],
      },
    ],
  },
];

const expectedUrls = {
  parent: '/parent?query=param#fragment',
  child: '/parent/child?query=param#fragment',
  grandchild: '/parent/child/grandchild?query=param#fragment',
} as const;

describe(`${LocalRouterSignalStore.name} nested route URL`, () => {
  describe('Given three layers of routes with components', () => {
    const paramsInheritanceStrategies: RouterConfigOptions['paramsInheritanceStrategy'][] =
      ['always', 'emptyOnly'];

    describe.each(paramsInheritanceStrategies)(
      '  And the "%s" route parameter inheritance strategy is used',
      (paramsInheritanceStrategy) => {
        it.each(
          [
            LocalRouterSignalStoreTestParentComponent,
            LocalRouterSignalStoreTestChildComponent,
            LocalRouterSignalStoreTestGrandchildComponent,
          ].map((RoutedComponent) => ({ RoutedComponent }))
        )(
          `  And ${RouterSignalStore.name} is injected at $RoutedComponent.name
        When the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is activated
        Then the full URL for the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is emitted`,
          async ({ RoutedComponent }) => {
            const { routerSignalStore } = await localRouterSignalStoreSetup({
              navigateTo: '/parent/child/grandchild?query=param#fragment',
              paramsInheritanceStrategy,
              RoutedComponent,
              routes,
            });

            expect(routerSignalStore.url()).toEqual(expectedUrls.grandchild);
          }
        );

        it.each(
          [
            LocalRouterSignalStoreTestParentComponent,
            LocalRouterSignalStoreTestChildComponent,
          ].map((RoutedComponent) => ({ RoutedComponent }))
        )(
          `  And ${RouterSignalStore.name} is injected at $RoutedComponent.name
        When the ${LocalRouterSignalStoreTestChildComponent.name} route is activated
        Then the full URL for the ${LocalRouterSignalStoreTestChildComponent.name} route is emitted`,
          async ({ RoutedComponent }) => {
            const { routerSignalStore } = await localRouterSignalStoreSetup({
              navigateTo: '/parent/child?query=param#fragment',
              paramsInheritanceStrategy,
              RoutedComponent,
              routes,
            });

            expect(routerSignalStore.url()).toEqual(expectedUrls.child);
          }
        );

        it(`  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestParentComponent}.name
        When the ${LocalRouterSignalStoreTestParentComponent.name} route is activated
        Then full URL for the ${LocalRouterSignalStoreTestParentComponent.name} route is emitted`, async () => {
          const { routerSignalStore } = await localRouterSignalStoreSetup({
            navigateTo: '/parent?query=param#fragment',
            paramsInheritanceStrategy,
            RoutedComponent: LocalRouterSignalStoreTestParentComponent,
            routes,
          });

          expect(routerSignalStore.url()).toEqual(expectedUrls.parent);
        });
      }
    );
  });
});
