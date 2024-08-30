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

const expectedUrls = {
  parent: '/parent?query=param#fragment',
  child: '/parent/child?query=param#fragment',
  grandchild: '/parent/child/grandchild?query=param#fragment',
} as const;

describe(`${GlobalRouterStore.name} nested route URL`, () => {
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
        Then the full URL for the ${GlobalRouterStoreTestGrandchildComponent.name} route is emitted`,
          async ({ RoutedComponent }) => {
            expect.assertions(1);
            const { routerStore } = await globalRouterStoreSetup({
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
            GlobalRouterStoreTestParentComponent,
            GlobalRouterStoreTestChildComponent,
          ].map((RoutedComponent) => ({ RoutedComponent }))
        )(
          `  And ${RouterStore.name} is injected at $RoutedComponent.name
        When the ${GlobalRouterStoreTestChildComponent.name} route is activated
        Then the full URL for the ${GlobalRouterStoreTestChildComponent.name} route is emitted`,
          async ({ RoutedComponent }) => {
            expect.assertions(1);
            const { routerStore } = await globalRouterStoreSetup({
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

        it(`  And ${RouterStore.name} is injected at ${GlobalRouterStoreTestParentComponent}.name
        When the ${GlobalRouterStoreTestParentComponent.name} route is activated
        Then full URL for the ${GlobalRouterStoreTestParentComponent.name} route is emitted`, async () => {
          expect.assertions(1);
          const { routerStore } = await globalRouterStoreSetup({
            navigateTo: '/parent?query=param#fragment',
            paramsInheritanceStrategy,
            RoutedComponent: GlobalRouterStoreTestParentComponent,
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
