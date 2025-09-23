import { RouterConfigOptions, Routes } from '@angular/router';
import { RouterSignalStore } from '../router-signal-store';
import { urlSearchParamsToStrictQueryParams } from '../util-urls/url-search-params-to-strict-query-params';
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
const queryParameters = new URLSearchParams();
queryParameters.append('size', 'medium');
queryParameters.append('color', 'blue');
queryParameters.append('color', 'red');
const expectedQueryParameters =
  urlSearchParamsToStrictQueryParams(queryParameters);

describe(`${GlobalRouterSignalStore.name} query parameters`, () => {
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
      Then the query parameters signal emits the expected query parameters`,
          async ({ RoutedComponent }) => {
            const { routerSignalStore, ngrxRouterStore, ngrxStore } =
              await globalRouterSignalStoreSetup({
                navigateTo: `/parent/child/grandchild?${queryParameters}`,
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.queryParams()).toEqual(
              expectedQueryParameters
            );
            expect(
              ngrxStore.selectSignal(ngrxRouterStore.selectQueryParams)()
            ).toEqual(expectedQueryParameters);
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
      Then the specific query parameter signals emit the expected values`,
          async ({ RoutedComponent }) => {
            const { routerSignalStore, ngrxRouterStore, ngrxStore } =
              await globalRouterSignalStoreSetup({
                navigateTo: `/parent/child/grandchild?${queryParameters}`,
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.selectQueryParam('size')()).toBe('medium');
            expect(
              ngrxStore.selectSignal(ngrxRouterStore.selectQueryParam('size'))()
            ).toBe('medium');

            expect(routerSignalStore.selectQueryParam('color')()).toEqual([
              'blue',
              'red',
            ]);
            expect(
              ngrxStore.selectSignal(
                ngrxRouterStore.selectQueryParam('color')
              )()
            ).toEqual(['blue', 'red']);

            expect(
              routerSignalStore.selectQueryParam('missing')()
            ).toBeUndefined();
            expect(
              ngrxStore.selectSignal(
                ngrxRouterStore.selectQueryParam('missing')
              )()
            ).toBeUndefined();
          }
        );
      }
    );
  });
});
