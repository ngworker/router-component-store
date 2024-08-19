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

const expectedUrls = {
  parent: '/parent?query=param#fragment',
  child: '/parent/child?query=param#fragment',
  grandchild: '/parent/child/grandchild?query=param#fragment',
} as const;

describe(`${LocalRouterStore.name} nested route URL`, () => {
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
        Then the full URL for the ${LocalRouterStoreTestGrandchildComponent.name} route is emitted`,
          async ({ RoutedComponent }) => {
            expect.assertions(1);
            const { routerStore } = await localRouterStoreSetup({
              navigateTo: '/parent/child/grandchild?query=param#fragment',
              paramsInheritanceStrategy,
              RoutedComponent,
              routes,
            });

            await expect(firstValueFrom(routerStore.url$)).resolves.toEqual(
              expectedUrls.grandchild
            );
          }
        );

        it.each(
          [
            LocalRouterStoreTestParentComponent,
            LocalRouterStoreTestChildComponent,
          ].map((RoutedComponent) => ({ RoutedComponent }))
        )(
          `  And ${RouterStore.name} is injected at $RoutedComponent.name
        When the ${LocalRouterStoreTestChildComponent.name} route is activated
        Then the full URL for the ${LocalRouterStoreTestChildComponent.name} route is emitted`,
          async ({ RoutedComponent }) => {
            expect.assertions(1);
            const { routerStore } = await localRouterStoreSetup({
              navigateTo: '/parent/child?query=param#fragment',
              paramsInheritanceStrategy,
              RoutedComponent,
              routes,
            });

            await expect(firstValueFrom(routerStore.url$)).resolves.toEqual(
              expectedUrls.child
            );
          }
        );

        it(`  And ${RouterStore.name} is injected at ${LocalRouterStoreTestParentComponent}.name
        When the ${LocalRouterStoreTestParentComponent.name} route is activated
        Then full URL for the ${LocalRouterStoreTestParentComponent.name} route is emitted`, async () => {
          expect.assertions(1);
          const { routerStore } = await localRouterStoreSetup({
            navigateTo: '/parent?query=param#fragment',
            paramsInheritanceStrategy,
            RoutedComponent: LocalRouterStoreTestParentComponent,
            routes,
          });

          await expect(firstValueFrom(routerStore.url$)).resolves.toEqual(
            expectedUrls.parent
          );
        });
      }
    );
  });
});
