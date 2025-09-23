import {
  ActivatedRouteSnapshot,
  RouterConfigOptions,
  Routes,
} from '@angular/router';
import { RouterSignalStore } from '../router-signal-store';
import { GlobalRouterSignalStore } from './global-router-signal-store';
import { globalRouterSignalStoreSetup } from './test-util/global-router-signal-store-setup';
import {
  GlobalRouterSignalStoreTestChildComponent,
  GlobalRouterSignalStoreTestGrandchildComponent,
  GlobalRouterSignalStoreTestParentComponent,
} from './test-util/global-router-signal-store-test-components';

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

describe(`${GlobalRouterSignalStore.name} nested current route`, () => {
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
      Then the current route signal emits the leaf route`,
          async ({ RoutedComponent }) => {
            const expectedRoute = createExpectedRoute('grandchild');
            const { routerSignalStore, ngrxRouterStore, ngrxStore } =
              await globalRouterSignalStoreSetup({
                navigateTo: '/parent/child/grandchild',
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.currentRoute()).toEqual(expectedRoute);
            expect(
              ngrxStore.selectSignal(ngrxRouterStore.selectCurrentRoute)()
            ).toEqual(expectedRoute);
          }
        );

        it.each(
          [
            GlobalRouterSignalStoreTestParentComponent,
            GlobalRouterSignalStoreTestChildComponent,
          ].map((RoutedComponent) => ({ RoutedComponent }))
        )(
          `  And ${RouterSignalStore.name} is injected at $RoutedComponent.name
      When the ${GlobalRouterSignalStoreTestChildComponent.name} route is activated
      Then the current route signal emits the leaf route`,
          async ({ RoutedComponent }) => {
            const expectedRoute = createExpectedRoute('child');
            const { routerSignalStore, ngrxRouterStore, ngrxStore } =
              await globalRouterSignalStoreSetup({
                navigateTo: '/parent/child',
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.currentRoute()).toEqual(expectedRoute);
            expect(
              ngrxStore.selectSignal(ngrxRouterStore.selectCurrentRoute)()
            ).toEqual(expectedRoute);
          }
        );

        it.each(
          [GlobalRouterSignalStoreTestParentComponent].map(
            (RoutedComponent) => ({ RoutedComponent })
          )
        )(
          `  And ${RouterSignalStore.name} is injected at $RoutedComponent.name
      When the ${GlobalRouterSignalStoreTestParentComponent.name} route is activated
      Then the current route signal emits the leaf route`,
          async ({ RoutedComponent }) => {
            const expectedRoute = createExpectedRoute('parent');
            const { routerSignalStore, ngrxRouterStore, ngrxStore } =
              await globalRouterSignalStoreSetup({
                navigateTo: '/parent',
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.currentRoute()).toEqual(expectedRoute);
            expect(
              ngrxStore.selectSignal(ngrxRouterStore.selectCurrentRoute)()
            ).toEqual(expectedRoute);
          }
        );
      }
    );
  });
});
