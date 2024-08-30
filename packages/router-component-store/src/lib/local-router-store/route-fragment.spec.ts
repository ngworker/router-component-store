import { RouterConfigOptions, Routes } from '@angular/router';
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
    path: 'parent',
    component: LocalRouterStoreTestParentComponent,
    children: [
      {
        path: 'child',
        component: LocalRouterStoreTestChildComponent,
        children: [
          {
            path: 'grandchild',
            component: LocalRouterStoreTestGrandchildComponent,
          },
        ],
      },
    ],
  },
];

describe(`${LocalRouterStore.name} route fragment`, () => {
  describe('Given three layers of routes with components', () => {
    const paramsInheritanceStrategies: RouterConfigOptions['paramsInheritanceStrategy'][] =
      ['always', 'emptyOnly'];

    describe.each(paramsInheritanceStrategies)(
      '  And the "%s" route parameter inheritance strategy is used',
      (paramsInheritanceStrategy) => {
        it.each(
          [
            LocalRouterStoreTestParentComponent,
            LocalRouterStoreTestChildComponent,
            LocalRouterStoreTestGrandchildComponent,
          ].map((RoutedComponent) => ({ RoutedComponent }))
        )(
          `  And ${RouterStore.name} is injected at $RoutedComponent.name
      When the ${LocalRouterStoreTestGrandchildComponent.name} route is activated
      Then the route fragment is emitted`,
          async ({ RoutedComponent }) => {
            expect.assertions(2);
            const expectedRouteFragment = 'route-fragment';
            const { activatedRoute, routerStore } = await localRouterStoreSetup(
              {
                navigateTo: `/parent/child/grandchild#${expectedRouteFragment}`,
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              }
            );

            await expect(
              firstValueFrom(routerStore.fragment$)
            ).resolves.toEqual(expectedRouteFragment);
            await expect(
              firstValueFrom(activatedRoute.fragment)
            ).resolves.toEqual(expectedRouteFragment);
          }
        );

        it.each(
          [
            LocalRouterStoreTestParentComponent,
            LocalRouterStoreTestChildComponent,
          ].map((RoutedComponent) => ({
            RoutedComponent,
          }))
        )(
          `  And ${RouterStore.name} is injected at $RoutedComponent.name
      When the ${LocalRouterStoreTestChildComponent.name} route is activated
      Then the route fragment is emitted`,
          async ({ RoutedComponent }) => {
            expect.assertions(2);
            const expectedRouteFragment = 'route-fragment';
            const { activatedRoute, routerStore } = await localRouterStoreSetup(
              {
                navigateTo: `/parent/child/grandchild#${expectedRouteFragment}`,
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              }
            );

            await expect(
              firstValueFrom(routerStore.fragment$)
            ).resolves.toEqual(expectedRouteFragment);
            await expect(
              firstValueFrom(activatedRoute.fragment)
            ).resolves.toEqual(expectedRouteFragment);
          }
        );

        it(`  And ${RouterStore.name} is injected at ${LocalRouterStoreTestGrandchildComponent.name}
      When the ${LocalRouterStoreTestGrandchildComponent.name} route is activated
      Then the route fragment is emitted`, async () => {
          expect.assertions(2);
          const expectedRouteFragment = 'route-fragment';
          const { activatedRoute, routerStore } = await localRouterStoreSetup({
            navigateTo: `/parent/child/grandchild#${expectedRouteFragment}`,
            paramsInheritanceStrategy,
            RoutedComponent: LocalRouterStoreTestParentComponent,
            routes,
          });

          await expect(firstValueFrom(routerStore.fragment$)).resolves.toEqual(
            expectedRouteFragment
          );
          await expect(
            firstValueFrom(activatedRoute.fragment)
          ).resolves.toEqual(expectedRouteFragment);
        });
      }
    );
  });
});
