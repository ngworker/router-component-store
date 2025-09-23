import { RouterConfigOptions, Routes } from '@angular/router';
import { RouterSignalStore } from '../router-signal-store';
import { GlobalRouterSignalStore } from './global-router-signal-store';
import { globalRouterSignalStoreSetup } from './test-util/global-router-signal-store-setup';
import {
  GlobalRouterSignalStoreTestChildComponent,
  GlobalRouterSignalStoreTestGrandchildComponent,
  GlobalRouterSignalStoreTestParentComponent,
} from './test-util/global-router-signal-store-test-components';

const routes: Routes = [
  {
    path: 'parent',
    component: GlobalRouterSignalStoreTestParentComponent,
    children: [
      {
        path: 'child',
        component: GlobalRouterSignalStoreTestChildComponent,
        children: [
          {
            path: 'grandchild',
            component: GlobalRouterSignalStoreTestGrandchildComponent,
          },
        ],
      },
    ],
  },
];

describe(`${GlobalRouterSignalStore.name} route fragment`, () => {
  describe('Given three layers of routes with components', () => {
    const paramsInheritanceStrategies: RouterConfigOptions['paramsInheritanceStrategy'][] =
      ['always', 'emptyOnly'];

    describe.each(paramsInheritanceStrategies)(
      '  And the "%s" route parameter inheritance strategy is used',
      (paramsInheritanceStrategy) => {
        it.each(
          [
            GlobalRouterSignalStoreTestParentComponent,
            GlobalRouterSignalStoreTestChildComponent,
            GlobalRouterSignalStoreTestGrandchildComponent,
          ].map((RoutedComponent) => ({ RoutedComponent }))
        )(
          `  And ${RouterSignalStore.name} is injected at $RoutedComponent.name
      When the ${GlobalRouterSignalStoreTestGrandchildComponent.name} route is activated
      Then the route fragment signal emits the expected fragment`,
          async ({ RoutedComponent }) => {
            const expectedFragment = 'test-fragment';
            const { routerSignalStore, ngrxRouterStore, ngrxStore } =
              await globalRouterSignalStoreSetup({
                navigateTo: `/parent/child/grandchild#${expectedFragment}`,
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.fragment()).toBe(expectedFragment);
            expect(
              ngrxStore.selectSignal(ngrxRouterStore.selectFragment)()
            ).toBe(expectedFragment);
          }
        );

        it.each(
          [
            GlobalRouterSignalStoreTestParentComponent,
            GlobalRouterSignalStoreTestChildComponent,
            GlobalRouterSignalStoreTestGrandchildComponent,
          ].map((RoutedComponent) => ({ RoutedComponent }))
        )(
          `  And ${RouterSignalStore.name} is injected at $RoutedComponent.name
      When the ${GlobalRouterSignalStoreTestGrandchildComponent.name} route is activated without fragment
      Then the route fragment signal emits null`,
          async ({ RoutedComponent }) => {
            const { routerSignalStore, ngrxRouterStore, ngrxStore } =
              await globalRouterSignalStoreSetup({
                navigateTo: `/parent/child/grandchild`,
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.fragment()).toBeNull();
            expect(
              ngrxStore.selectSignal(ngrxRouterStore.selectFragment)()
            ).toBeNull();
          }
        );
      }
    );
  });
});
