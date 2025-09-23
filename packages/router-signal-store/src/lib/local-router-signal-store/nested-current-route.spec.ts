import {
  ActivatedRouteSnapshot,
  RouterConfigOptions,
  Routes,
} from '@angular/router';
import { RouterSignalStore } from '../router-signal-store';
import { LocalRouterSignalStore } from './local-router-signal-store';
import { localRouterSignalStoreSetup } from './test-util/local-router-signal-store-setup';
import {
  LocalRouterSignalStoreTestChildComponent,
  LocalRouterSignalStoreTestGrandchildComponent,
  LocalRouterSignalStoreTestParentComponent,
} from './test-util/local-router-signal-store-test-components';

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

const expectedRoutes = {
  parent: createExpectedRoute('parent'),
  child: createExpectedRoute('child'),
  grandchild: createExpectedRoute('grandchild'),
} as const;

describe(`${LocalRouterSignalStore.name} nested current route`, () => {
  describe('Given three layers of routes with components', () => {
    const paramsInheritanceStrategies: RouterConfigOptions['paramsInheritanceStrategy'][] =
      ['always', 'emptyOnly'];

    describe.each(paramsInheritanceStrategies)(
      '  And the "%s" route parameter inheritance strategy is used',
      (paramsInheritanceStrategy) => {
        it.each(['/parent/child/grandchild', '/parent/child', '/parent'])(
          `  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestParentComponent.name}
        When the "%s" route is activated
        Then current route state for the ${LocalRouterSignalStoreTestParentComponent.name} route is emitted`,
          async (navigateTo) => {
            const { activatedRoute, routerSignalStore } =
              await localRouterSignalStoreSetup({
                navigateTo,
                paramsInheritanceStrategy,
                RoutedComponent: LocalRouterSignalStoreTestParentComponent,
                routes,
              });

            expect(routerSignalStore.currentRoute()).toEqual(
              expectedRoutes.parent
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
          `  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestChildComponent.name}
        When the "%s" route is activated
        Then current route state for the ${LocalRouterSignalStoreTestChildComponent.name} route is emitted`,
          async (navigateTo) => {
            const { activatedRoute, routerSignalStore } =
              await localRouterSignalStoreSetup({
                navigateTo,
                paramsInheritanceStrategy,
                RoutedComponent: LocalRouterSignalStoreTestChildComponent,
                routes,
              });

            expect(routerSignalStore.currentRoute()).toEqual(
              expectedRoutes.child
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

        it(`  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestGrandchildComponent.name}
          When the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is activated
          Then route state for the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is emitted`, async () => {
          const { activatedRoute, routerSignalStore } =
            await localRouterSignalStoreSetup({
              navigateTo: '/parent/child/grandchild',
              paramsInheritanceStrategy,
              RoutedComponent: LocalRouterSignalStoreTestGrandchildComponent,
              routes,
            });

          expect(routerSignalStore.currentRoute()).toEqual(
            expectedRoutes.grandchild
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
          }).toEqual(expectedRoutes.grandchild);
        });
      }
    );
  });
});
