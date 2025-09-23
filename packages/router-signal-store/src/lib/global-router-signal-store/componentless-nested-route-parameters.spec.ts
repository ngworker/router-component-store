import { Params, Routes } from '@angular/router';
import { createSelector } from '@ngrx/store';
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
    path: ':componentlessBeforeParent',
    children: [
      {
        path: ':parent',
        component: GlobalRouterSignalStoreTestParentComponent,
        children: [
          {
            path: ':componentlessBeforeChild',
            children: [
              {
                path: ':child',
                component: GlobalRouterSignalStoreTestChildComponent,
                children: [
                  {
                    path: ':componentlessBeforeGrandchild',
                    children: [
                      {
                        path: ':grandchild',
                        component:
                          GlobalRouterSignalStoreTestGrandchildComponent,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

describe(`${GlobalRouterSignalStore.name} componentless nested route parameters`, () => {
  describe(`Given three layers of routes with components and route parameters
    And a componentless route with route parameters before each of them`, () => {
    describe('And the default route parameter inheritance strategy is used', () => {
      it.each(
        [
          GlobalRouterSignalStoreTestParentComponent,
          GlobalRouterSignalStoreTestChildComponent,
          GlobalRouterSignalStoreTestGrandchildComponent,
        ].map((RoutedComponent) => ({ RoutedComponent }))
      )(
        `  And ${RouterSignalStore.name} is injected at $RoutedComponent.name
      When the ${GlobalRouterSignalStoreTestGrandchildComponent.name} route is activated
      Then route parameters for the ${GlobalRouterSignalStoreTestGrandchildComponent.name} route are emitted`,
        async ({ RoutedComponent }) => {
          const expectedRouteParams: Params = {
            componentlessBeforeGrandchild: 'componentless-before-grandchild-1',
            grandchild: 'grandchild-1',
          };
          const { routerSignalStore, ngrxRouterStore, ngrxStore } =
            await globalRouterSignalStoreSetup({
              navigateTo:
                '/componentless-before-parent-1/parent-1/componentless-before-child-1/child-1/componentless-before-grandchild-1/grandchild-1',
              RoutedComponent,
              routes,
            });

          expect(routerSignalStore.routeParams()).toEqual(expectedRouteParams);
          expect(
            ngrxStore.selectSignal(ngrxRouterStore.selectRouteParams)()
          ).toEqual(expectedRouteParams);
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
      When the ${GlobalRouterSignalStoreTestGrandchildComponent.name} route is activated
      Then specific route parameter signals emit the expected values`,
        async ({ RoutedComponent }) => {
          const { routerSignalStore, ngrxRouterStore, ngrxStore } =
            await globalRouterSignalStoreSetup({
              navigateTo:
                '/componentless-before-parent-1/parent-1/componentless-before-child-1/child-1/componentless-before-grandchild-1/grandchild-1',
              RoutedComponent,
              routes,
            });

          expect(routerSignalStore.selectRouteParam('grandchild')()).toBe(
            'grandchild-1'
          );
          expect(
            ngrxStore.selectSignal(
              ngrxRouterStore.selectRouteParam('grandchild')
            )()
          ).toBe('grandchild-1');

          expect(routerSignalStore.selectRouteParam('child')()).toBeUndefined();
          expect(
            ngrxStore.selectSignal(ngrxRouterStore.selectRouteParam('child'))()
          ).toBeUndefined();

          expect(
            routerSignalStore.selectRouteParam('parent')()
          ).toBeUndefined();
          expect(
            ngrxStore.selectSignal(ngrxRouterStore.selectRouteParam('parent'))()
          ).toBeUndefined();

          expect(
            routerSignalStore.selectRouteParam('missing')()
          ).toBeUndefined();
          expect(
            ngrxStore.selectSignal(
              ngrxRouterStore.selectRouteParam('missing')
            )()
          ).toBeUndefined();
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
      When the ${GlobalRouterSignalStoreTestGrandchildComponent.name} route is activated
      Then the router signals consistently emit the same route params`,
        async ({ RoutedComponent }) => {
          const { routerSignalStore, ngrxStore, ngrxRouterStore } =
            await globalRouterSignalStoreSetup({
              navigateTo:
                '/componentless-before-parent-1/parent-1/componentless-before-child-1/child-1/componentless-before-grandchild-1/grandchild-1',
              RoutedComponent,
              routes,
            });

          const allRouteParams = createSelector(
            ngrxRouterStore.selectRouteParams,
            (routeParams) => routeParams
          );

          // Allow time for any async operations to complete
          await new Promise((resolve) => setTimeout(resolve, 100));

          const routerSignalStoreRouteParams = routerSignalStore.routeParams();
          const ngrxStoreRouteParams = ngrxStore.selectSignal(allRouteParams)();

          expect(routerSignalStoreRouteParams).toEqual({
            componentlessBeforeGrandchild: 'componentless-before-grandchild-1',
            grandchild: 'grandchild-1',
          });
          expect(ngrxStoreRouteParams).toEqual({
            componentlessBeforeGrandchild: 'componentless-before-grandchild-1',
            grandchild: 'grandchild-1',
          });
        }
      );
    });
  });
});
