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
    path: 'parent/:parentParam',
    component: GlobalRouterSignalStoreTestParentComponent,
    children: [
      {
        path: 'child/:childParam',
        component: GlobalRouterSignalStoreTestChildComponent,
        children: [
          {
            path: 'grandchild/:grandchildParam',
            component: GlobalRouterSignalStoreTestGrandchildComponent,
          },
        ],
      },
    ],
  },
];

describe(`${GlobalRouterSignalStore.name} nested route parameters`, () => {
  describe('Given three layers of routes with route parameters', () => {
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
      Then the route parameters signal emits the current route parameters`,
          async ({ RoutedComponent }) => {
            const expectedRouteParams =
              paramsInheritanceStrategy === 'always'
                ? {
                    parentParam: 'parent-1',
                    childParam: 'child-1',
                    grandchildParam: 'grandchild-1',
                  }
                : { grandchildParam: 'grandchild-1' };
            const { routerSignalStore, ngrxRouterStore, ngrxStore } =
              await globalRouterSignalStoreSetup({
                navigateTo:
                  '/parent/parent-1/child/child-1/grandchild/grandchild-1',
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.routeParams()).toEqual(
              expectedRouteParams
            );
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
      Then the specific route parameter signals emit the expected values`,
          async ({ RoutedComponent }) => {
            const { routerSignalStore, ngrxRouterStore, ngrxStore } =
              await globalRouterSignalStoreSetup({
                navigateTo:
                  '/parent/parent-1/child/child-1/grandchild/grandchild-1',
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(
              routerSignalStore.selectRouteParam('grandchildParam')()
            ).toBe('grandchild-1');
            expect(
              ngrxStore.selectSignal(
                ngrxRouterStore.selectRouteParam('grandchildParam')
              )()
            ).toBe('grandchild-1');

            const expectedChildParam =
              paramsInheritanceStrategy === 'always' ? 'child-1' : undefined;
            expect(routerSignalStore.selectRouteParam('childParam')()).toBe(
              expectedChildParam
            );
            expect(
              ngrxStore.selectSignal(
                ngrxRouterStore.selectRouteParam('childParam')
              )()
            ).toBe(expectedChildParam);

            const expectedParentParam =
              paramsInheritanceStrategy === 'always' ? 'parent-1' : undefined;
            expect(routerSignalStore.selectRouteParam('parentParam')()).toBe(
              expectedParentParam
            );
            expect(
              ngrxStore.selectSignal(
                ngrxRouterStore.selectRouteParam('parentParam')
              )()
            ).toBe(expectedParentParam);

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
      }
    );
  });
});
