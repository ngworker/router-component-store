import { RouterConfigOptions, Routes } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RouterStore } from '../router-store';
import { urlSearchParamsToStrictQueryParams } from '../util-urls/url-search-params-to-strict-query-params';
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
const queryParameters = new URLSearchParams();
queryParameters.append('size', 'medium');
queryParameters.append('color', 'blue');
queryParameters.append('color', 'red');
const expectedQueryParameters =
  urlSearchParamsToStrictQueryParams(queryParameters);

describe(`${GlobalRouterStore.name} query parameters`, () => {
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
      Then the query parameters are emitted`,
          async ({ RoutedComponent }) => {
            expect.assertions(2);
            const { ngrxRouterStore, ngrxStore, routerStore } =
              await globalRouterStoreSetup({
                navigateTo: `/parent/child/grandchild?${queryParameters}`,
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            await expect(
              firstValueFrom(routerStore.queryParams$)
            ).resolves.toEqual(expectedQueryParameters);
            await expect(
              firstValueFrom(
                ngrxStore.select(ngrxRouterStore.selectQueryParams)
              )
            ).resolves.toEqual(expectedQueryParameters);
          }
        );

        it.each(
          [
            GlobalRouterStoreTestParentComponent,
            GlobalRouterStoreTestChildComponent,
          ].map((RoutedComponent) => ({
            RoutedComponent,
          }))
        )(
          `  And ${RouterStore.name} is injected at $RoutedComponent.name
      When the ${GlobalRouterStoreTestChildComponent.name} route is activated
      Then the query parameters are emitted`,
          async ({ RoutedComponent }) => {
            expect.assertions(2);
            const { ngrxRouterStore, ngrxStore, routerStore } =
              await globalRouterStoreSetup({
                navigateTo: `/parent/child/grandchild?${queryParameters}`,
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            await expect(
              firstValueFrom(routerStore.queryParams$)
            ).resolves.toEqual(expectedQueryParameters);
            await expect(
              firstValueFrom(
                ngrxStore.select(ngrxRouterStore.selectQueryParams)
              )
            ).resolves.toEqual(expectedQueryParameters);
          }
        );

        it(`  And ${RouterStore.name} is injected at ${GlobalRouterStoreTestGrandchildComponent.name}
      When the ${GlobalRouterStoreTestGrandchildComponent.name} route is activated
      Then the query parameters are emitted`, async () => {
          expect.assertions(2);
          const { ngrxRouterStore, ngrxStore, routerStore } =
            await globalRouterStoreSetup({
              navigateTo: `/parent/child/grandchild?${queryParameters}`,
              paramsInheritanceStrategy,
              RoutedComponent: GlobalRouterStoreTestParentComponent,
              routes,
            });

          await expect(
            firstValueFrom(routerStore.queryParams$)
          ).resolves.toEqual(expectedQueryParameters);
          await expect(
            firstValueFrom(ngrxStore.select(ngrxRouterStore.selectQueryParams))
          ).resolves.toEqual(expectedQueryParameters);
        });
      }
    );
  });
});
