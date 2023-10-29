import { RouterConfigOptions, Routes } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RouterStore } from '../router-store';
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
    children: [
      {
        path: 'child',
        component: GlobalRouterStoreTestChildComponent,
        children: [
          {
            path: 'grandchild',
            component: GlobalRouterStoreTestGrandchildComponent,
          },
        ],
      },
    ],
  },
];

describe(`${GlobalRouterStore.name} route fragment`, () => {
  describe('Given three layers of routes with components', () => {
    const paramsInheritanceStrategies: RouterConfigOptions['paramsInheritanceStrategy'][] =
      ['always', 'emptyOnly'];

    describe.each(paramsInheritanceStrategies)(
      '  And the "%s" route parameter inheritance strategy is used',
      (paramsInheritanceStrategy) => {
        it.each(
          [
            GlobalRouterStoreTestParentComponent,
            GlobalRouterStoreTestChildComponent,
            GlobalRouterStoreTestGrandchildComponent,
          ].map((RoutedComponent) => ({ RoutedComponent }))
        )(
          `  And ${RouterStore.name} is injected at $RoutedComponent.name
      When the ${GlobalRouterStoreTestGrandchildComponent.name} route is activated
      Then the route fragment is emitted`,
          async ({ RoutedComponent }) => {
            expect.assertions(2);
            const expectedRouteFragment = 'route-fragment';
            const { ngrxRouterStore, ngrxStore, routerStore } =
              await globalRouterStoreSetup({
                navigateTo: `/parent/child/grandchild#${expectedRouteFragment}`,
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            await expect(
              firstValueFrom(routerStore.fragment$)
            ).resolves.toEqual(expectedRouteFragment);
            await expect(
              firstValueFrom(ngrxStore.select(ngrxRouterStore.selectFragment))
            ).resolves.toEqual(expectedRouteFragment);
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
      Then the route fragment is emitted`,
          async ({ RoutedComponent }) => {
            expect.assertions(2);
            const expectedRouteFragment = 'route-fragment';
            const { ngrxRouterStore, ngrxStore, routerStore } =
              await globalRouterStoreSetup({
                navigateTo: `/parent/child/grandchild#${expectedRouteFragment}`,
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            await expect(
              firstValueFrom(routerStore.fragment$)
            ).resolves.toEqual(expectedRouteFragment);
            await expect(
              firstValueFrom(ngrxStore.select(ngrxRouterStore.selectFragment))
            ).resolves.toEqual(expectedRouteFragment);
          }
        );

        it(`  And ${RouterStore.name} is injected at ${GlobalRouterStoreTestGrandchildComponent.name}
      When the ${GlobalRouterStoreTestGrandchildComponent.name} route is activated
      Then the route fragment is emitted`, async () => {
          expect.assertions(2);
          const expectedRouteFragment = 'route-fragment';
          const { ngrxRouterStore, ngrxStore, routerStore } =
            await globalRouterStoreSetup({
              navigateTo: `/parent/child/grandchild#${expectedRouteFragment}`,
              paramsInheritanceStrategy,
              RoutedComponent: GlobalRouterStoreTestParentComponent,
              routes,
            });

          await expect(firstValueFrom(routerStore.fragment$)).resolves.toEqual(
            expectedRouteFragment
          );
          await expect(
            firstValueFrom(ngrxStore.select(ngrxRouterStore.selectFragment))
          ).resolves.toEqual(expectedRouteFragment);
        });
      }
    );
  });
});
