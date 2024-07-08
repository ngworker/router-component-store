import {
  ActivatedRouteSnapshot,
  RouterConfigOptions,
  Routes,
} from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RouterStore } from '../router-store';
import { LocalRouterStore } from './local-router-store';
import { localRouterStoreSetup } from './test-util/local-router-store-setup';
import {
  LocalRouterStoreTestChildComponent,
  LocalRouterStoreTestGrandchildComponent,
  LocalRouterStoreTestParentComponent,
} from './test-util/local-router-store-test-components';

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

const expectedRoutes = {
  parent: createExpectedRoute('parent'),
  child: createExpectedRoute('child'),
  grandchild: createExpectedRoute('grandchild'),
} as const;

describe(`${LocalRouterStore.name} nested current route`, () => {
  describe('Given three layers of routes with components', () => {
    const paramsInheritanceStrategies: RouterConfigOptions['paramsInheritanceStrategy'][] =
      ['always', 'emptyOnly'];

    describe.each(paramsInheritanceStrategies)(
      '  And the "%s" route parameter inheritance strategy is used',
      (paramsInheritanceStrategy) => {
        it.each(['/parent/child/grandchild', '/parent/child', '/parent'])(
          `  And ${RouterStore.name} is injected at ${LocalRouterStoreTestParentComponent.name}
        When the "%s" route is activated
        Then current route state for the ${LocalRouterStoreTestParentComponent.name} route is emitted`,
          async (navigateTo) => {
            expect.assertions(2);
            const { activatedRoute, routerStore } = await localRouterStoreSetup(
              {
                navigateTo,
                paramsInheritanceStrategy,
                RoutedComponent: LocalRouterStoreTestParentComponent,
                routes,
              }
            );

            await expect(
              firstValueFrom(routerStore.currentRoute$)
            ).resolves.toEqual(
              navigateTo === '/parent'
                ? expectedRoutes.parent
                : navigateTo === '/parent/child'
                ? expectedRoutes.child
                : expectedRoutes.grandchild
            );
            const {
              children,
              data,
              fragment,
              outlet,
              params,
              queryParams,
              routeConfig,
              url,
            } = activatedRoute.snapshot;
            expect({
              children,
              data,
              fragment,
              outlet,
              params,
              queryParams,
              routeConfig,
              url,
            }).toEqual(expectedRoutes.parent);
          }
        );

        it.each(['/parent/child/grandchild', '/parent/child'])(
          `  And ${RouterStore.name} is injected at ${LocalRouterStoreTestChildComponent.name}
        When the "%s" route is activated
        Then current route state for the ${LocalRouterStoreTestChildComponent.name} route is emitted`,
          async (navigateTo) => {
            expect.assertions(2);
            const { activatedRoute, routerStore } = await localRouterStoreSetup(
              {
                navigateTo,
                paramsInheritanceStrategy,
                RoutedComponent: LocalRouterStoreTestChildComponent,
                routes,
              }
            );

            await expect(
              firstValueFrom(routerStore.currentRoute$)
            ).resolves.toEqual(
              navigateTo === '/parent/child'
                ? expectedRoutes.child
                : expectedRoutes.grandchild
            );
            const {
              children,
              data,
              fragment,
              outlet,
              params,
              queryParams,
              routeConfig,
              url,
            } = activatedRoute.snapshot;
            expect({
              children,
              data,
              fragment,
              outlet,
              params,
              queryParams,
              routeConfig,
              url,
            }).toEqual(expectedRoutes.child);
          }
        );

        it(`  And ${RouterStore.name} is injected at ${LocalRouterStoreTestGrandchildComponent.name}
          When the ${LocalRouterStoreTestGrandchildComponent.name} route is activated
          Then route state for the ${LocalRouterStoreTestGrandchildComponent.name} route is emitted`, async () => {
          expect.assertions(2);
          const { activatedRoute, routerStore } = await localRouterStoreSetup({
            navigateTo: '/parent/child/grandchild',
            paramsInheritanceStrategy,
            RoutedComponent: LocalRouterStoreTestGrandchildComponent,
            routes,
          });

          await expect(
            firstValueFrom(routerStore.currentRoute$)
          ).resolves.toEqual(expectedRoutes.grandchild);
          const {
            children,
            data,
            fragment,
            outlet,
            params,
            queryParams,
            routeConfig,
            url,
          } = activatedRoute.snapshot;
          expect({
            children,
            data,
            fragment,
            outlet,
            params,
            queryParams,
            routeConfig,
            url,
          }).toEqual(expectedRoutes.grandchild);
        });
      }
    );
  });
});
