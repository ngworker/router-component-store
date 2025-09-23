import { RouterConfigOptions, Routes } from '@angular/router';
import { RouterSignalStore } from '../router-signal-store';
import { urlSearchParamsToStrictQueryParams } from '../util-urls/url-search-params-to-strict-query-params';
import { LocalRouterSignalStore } from './local-router-signal-store';
import { localRouterSignalStoreSetup } from './test-util/local-router-signal-store-setup';
import {
  LocalRouterSignalStoreTestChildComponent,
  LocalRouterSignalStoreTestGrandchildComponent,
  LocalRouterSignalStoreTestParentComponent,
} from './test-util/local-router-signal-store-test-components';

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
const queryParameters = new URLSearchParams();
queryParameters.append('size', 'medium');
queryParameters.append('color', 'blue');
queryParameters.append('color', 'red');
const expectedQueryParameters =
  urlSearchParamsToStrictQueryParams(queryParameters);

describe(`${LocalRouterSignalStore.name} query parameters`, () => {
  describe('Given three layers of routes with components', () => {
    const paramsInheritanceStrategies: RouterConfigOptions['paramsInheritanceStrategy'][] =
      ['always', 'emptyOnly'];

    describe.each(paramsInheritanceStrategies)(
      '  And the "%s" route parameter inheritance strategy is used',
      (paramsInheritanceStrategy) => {
        it.each(
          [
            LocalRouterSignalStoreTestParentComponent,
            LocalRouterSignalStoreTestChildComponent,
            LocalRouterSignalStoreTestGrandchildComponent,
          ].map((RoutedComponent) => ({ RoutedComponent }))
        )(
          `  And ${RouterSignalStore.name} is injected at $RoutedComponent.name
      When the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is activated
      Then the query parameters are emitted`,
          async ({ RoutedComponent }) => {
            const { activatedRoute, routerSignalStore, toSignal } =
              await localRouterSignalStoreSetup({
                navigateTo: `/parent/child/grandchild?${queryParameters}`,
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.queryParams()).toEqual(
              expectedQueryParameters
            );
            expect(toSignal(activatedRoute.queryParams)()).toEqual(
              expectedQueryParameters
            );
          }
        );

        it.each(
          [
            LocalRouterSignalStoreTestParentComponent,
            LocalRouterSignalStoreTestChildComponent,
            LocalRouterSignalStoreTestGrandchildComponent,
          ].map((RoutedComponent) => ({ RoutedComponent }))
        )(
          `  And ${RouterSignalStore.name} is injected at $RoutedComponent.name
      When the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is activated
      Then the query parameters are emitted`,
          async ({ RoutedComponent }) => {
            const { activatedRoute, routerSignalStore, toSignal } =
              await localRouterSignalStoreSetup({
                navigateTo: `/parent/child/grandchild?${queryParameters}`,
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.queryParams()).toEqual(
              expectedQueryParameters
            );
            expect(toSignal(activatedRoute.queryParams)()).toEqual(
              expectedQueryParameters
            );
          }
        );

        it(`  And ${RouterSignalStore.name} is injected at ${LocalRouterSignalStoreTestGrandchildComponent.name}
      When the ${LocalRouterSignalStoreTestGrandchildComponent.name} route is activated
      Then the query parameters are emitted`, async () => {
          const { activatedRoute, routerSignalStore, toSignal } =
            await localRouterSignalStoreSetup({
              navigateTo: `/parent/child/grandchild?${queryParameters}`,
              paramsInheritanceStrategy,
              RoutedComponent: LocalRouterSignalStoreTestParentComponent,
              routes,
            });

          expect(routerSignalStore.queryParams()).toEqual(
            expectedQueryParameters
          );
          expect(toSignal(activatedRoute.queryParams)()).toEqual(
            expectedQueryParameters
          );
        });
      }
    );
  });
});
