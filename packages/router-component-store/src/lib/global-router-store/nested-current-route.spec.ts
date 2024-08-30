import {
  ActivatedRouteSnapshot,
  RouterConfigOptions,
  Routes,
} from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RouterStore } from '../router-store';
import { GlobalRouterStore } from './global-router-store';
import { globalRouterStoreSetup } from './test-util/global-router-store-setup';
import {
  GlobalRouterStoreTestChildComponent,
  GlobalRouterStoreTestGrandchildComponent,
  GlobalRouterStoreTestParentComponent,
} from './test-util/global-router-store-test-components';

function createExpectedRoute(path: string): Partial<ActivatedRouteSnapshot> {
  return expect.objectContaining({
    children: expect.any(Array),
    data: {},
    fragment: null,
    outlet: 'primary',
    params: {},
    queryParams: {},
    routeConfig: expect.objectContaining({
      path,
    }),
    url: [
      expect.objectContaining({
        path,
        parameters: {},
      }),
    ],
  });
}

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

const expectedRoutes = {
  parent: createExpectedRoute('parent'),
  child: createExpectedRoute('child'),
  grandchild: createExpectedRoute('grandchild'),
} as const;

describe(`${GlobalRouterStore.name} nested current route`, () => {
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
        Then current route state for the ${GlobalRouterStoreTestGrandchildComponent.name} route is emitted`,
          async ({ RoutedComponent }) => {
            expect.assertions(1);
            const { routerStore } = await globalRouterStoreSetup({
              navigateTo: '/parent/child/grandchild',
              paramsInheritanceStrategy,
              RoutedComponent,
              routes,
            });

            await expect(
              firstValueFrom(routerStore.currentRoute$)
            ).resolves.toEqual(expectedRoutes.grandchild);
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
        Then current route state for the ${GlobalRouterStoreTestChildComponent.name} route is emitted`,
          async ({ RoutedComponent }) => {
            expect.assertions(1);
            const { routerStore } = await globalRouterStoreSetup({
              navigateTo: '/parent/child',
              paramsInheritanceStrategy,
              RoutedComponent,
              routes,
            });

            await expect(
              firstValueFrom(routerStore.currentRoute$)
            ).resolves.toEqual(expectedRoutes.child);
          }
        );

        it(`  And ${RouterStore.name} is injected at ${GlobalRouterStoreTestParentComponent}.name
        When the ${GlobalRouterStoreTestParentComponent.name} route is activated
        Then current route state for the ${GlobalRouterStoreTestParentComponent.name} route is emitted`, async () => {
          expect.assertions(1);
          const { routerStore } = await globalRouterStoreSetup({
            navigateTo: '/parent',
            paramsInheritanceStrategy,
            RoutedComponent: GlobalRouterStoreTestParentComponent,
            routes,
          });

          await expect(
            firstValueFrom(routerStore.currentRoute$)
          ).resolves.toEqual(expectedRoutes.parent);
        });
      }
    );
  });
});
