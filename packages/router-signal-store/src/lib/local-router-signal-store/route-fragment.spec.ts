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

describe(`${LocalRouterSignalStore.name} route fragment`, () => {
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
      When the grandchild route is activated with a fragment
      Then the route fragment signal emits the expected fragment`,
          async ({ RoutedComponent }) => {
            const expectedFragment = 'route-fragment';
            const { activatedRoute, routerSignalStore, toSignal } =
              await localRouterSignalStoreSetup({
                navigateTo: `/parent/child/grandchild#${expectedFragment}`,
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.fragment()).toBe(expectedFragment);
            expect(toSignal(activatedRoute.fragment)()).toBe(expectedFragment);
          }
        );

        it.each(
          [
            LocalRouterSignalStoreTestParentComponent,
            LocalRouterSignalStoreTestChildComponent,
            LocalRouterSignalStoreTestGrandchildComponent,
          ].map((RoutedComponent) => ({ RoutedComponent }))
        )(
          `  And ${RouterSignalStore.name} is injected at $RoutedComponent.name
      When the grandchild route is activated without fragment
      Then the route fragment signal emits null`,
          async ({ RoutedComponent }) => {
            const { activatedRoute, routerSignalStore, toSignal } =
              await localRouterSignalStoreSetup({
                navigateTo: `/parent/child/grandchild`,
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.fragment()).toBeNull();
            expect(toSignal(activatedRoute.fragment)()).toBeNull();
          }
        );
      }
    );
  });
});
