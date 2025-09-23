import { RouterConfigOptions, Routes } from '@angular/router';
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
    path: 'parent',
    component: GlobalRouterSignalStoreTestParentComponent,
    data: { level: 'parent', shared: 'parent-value' },
    children: [
      {
        path: 'child',
        component: GlobalRouterSignalStoreTestChildComponent,
        data: { level: 'child', shared: 'child-value' },
        children: [
          {
            path: 'grandchild',
            component: GlobalRouterSignalStoreTestGrandchildComponent,
            data: {
              level: 'grandchild',
              shared: 'grandchild-value',
              specific: 'test-data',
            },
          },
        ],
      },
    ],
  },
];

describe(`${GlobalRouterSignalStore.name} nested route data`, () => {
  describe('Given three layers of routes with route data', () => {
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
      Then the route data signal emits the current route data`,
          async ({ RoutedComponent }) => {
            const expectedRouteData = {
              level: 'grandchild',
              shared: 'grandchild-value',
              specific: 'test-data',
            };
            const { routerSignalStore, ngrxRouterStore, ngrxStore } =
              await globalRouterSignalStoreSetup({
                navigateTo: '/parent/child/grandchild',
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.routeData()).toEqual(expectedRouteData);
            expect(
              ngrxStore.selectSignal(ngrxRouterStore.selectRouteData)()
            ).toEqual(expectedRouteData);
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
      Then the specific route data signals emit the expected values`,
          async ({ RoutedComponent }) => {
            const { routerSignalStore, ngrxRouterStore, ngrxStore } =
              await globalRouterSignalStoreSetup({
                navigateTo: '/parent/child/grandchild',
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.selectRouteDataParam('level')()).toBe(
              'grandchild'
            );
            expect(
              ngrxStore.selectSignal(
                ngrxRouterStore.selectRouteDataParam('level')
              )()
            ).toBe('grandchild');

            expect(routerSignalStore.selectRouteDataParam('specific')()).toBe(
              'test-data'
            );
            expect(
              ngrxStore.selectSignal(
                ngrxRouterStore.selectRouteDataParam('specific')
              )()
            ).toBe('test-data');

            expect(
              routerSignalStore.selectRouteDataParam('missing')()
            ).toBeUndefined();
            expect(
              ngrxStore.selectSignal(
                ngrxRouterStore.selectRouteDataParam('missing')
              )()
            ).toBeUndefined();
          }
        );
      }
    );
  });
});
