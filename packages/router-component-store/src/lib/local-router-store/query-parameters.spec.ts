import { RouterConfigOptions, Routes } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RouterStore } from '../router-store';
import { urlSearchParamsToStrictQueryParams } from '../util-urls/url-search-params-to-strict-query-params';
import { LocalRouterStore } from './local-router-store';
import { localRouterStoreSetup } from './test-util/local-router-store-setup';
import {
  LocalRouterStoreTestChildComponent,
  LocalRouterStoreTestGrandchildComponent,
  LocalRouterStoreTestParentComponent,
} from './test-util/local-router-store-test-components';

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
const queryParameters = new URLSearchParams();
queryParameters.append('size', 'medium');
queryParameters.append('color', 'blue');
queryParameters.append('color', 'red');
const expectedQueryParameters =
  urlSearchParamsToStrictQueryParams(queryParameters);

describe(`${LocalRouterStore.name} query parameters`, () => {
  describe('Given three layers of routes with components', () => {
    const paramsInheritanceStrategies: RouterConfigOptions['paramsInheritanceStrategy'][] =
      ['always', 'emptyOnly'];

    describe.each(paramsInheritanceStrategies)(
      '  And the "%s" route parameter inheritance strategy is used',
      (paramsInheritanceStrategy) => {
        it.each(
          [
            LocalRouterStoreTestParentComponent,
            LocalRouterStoreTestChildComponent,
            LocalRouterStoreTestGrandchildComponent,
          ].map((RoutedComponent) => ({ RoutedComponent }))
        )(
          `  And ${RouterStore.name} is injected at $RoutedComponent.name
      When the ${LocalRouterStoreTestGrandchildComponent.name} route is activated
      Then the query parameters are emitted`,
          async ({ RoutedComponent }) => {
            expect.assertions(2);
            const { activatedRoute, routerStore } = await localRouterStoreSetup(
              {
                navigateTo: `/parent/child/grandchild?${queryParameters}`,
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              }
            );

            await expect(
              firstValueFrom(routerStore.queryParams$)
            ).resolves.toEqual(expectedQueryParameters);
            await expect(
              firstValueFrom(activatedRoute.queryParams)
            ).resolves.toEqual(expectedQueryParameters);
          }
        );

        it.each(
          [
            LocalRouterStoreTestParentComponent,
            LocalRouterStoreTestChildComponent,
          ].map((RoutedComponent) => ({
            RoutedComponent,
          }))
        )(
          `  And ${RouterStore.name} is injected at $RoutedComponent.name
      When the ${LocalRouterStoreTestChildComponent.name} route is activated
      Then the query parameters are emitted`,
          async ({ RoutedComponent }) => {
            expect.assertions(2);
            const { activatedRoute, routerStore } = await localRouterStoreSetup(
              {
                navigateTo: `/parent/child/grandchild?${queryParameters}`,
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              }
            );

            await expect(
              firstValueFrom(routerStore.queryParams$)
            ).resolves.toEqual(expectedQueryParameters);
            await expect(
              firstValueFrom(activatedRoute.queryParams)
            ).resolves.toEqual(expectedQueryParameters);
          }
        );

        it(`  And ${RouterStore.name} is injected at ${LocalRouterStoreTestGrandchildComponent.name}
      When the ${LocalRouterStoreTestGrandchildComponent.name} route is activated
      Then the query parameters are emitted`, async () => {
          expect.assertions(2);
          const { activatedRoute, routerStore } = await localRouterStoreSetup({
            navigateTo: `/parent/child/grandchild?${queryParameters}`,
            paramsInheritanceStrategy,
            RoutedComponent: LocalRouterStoreTestParentComponent,
            routes,
          });

          await expect(
            firstValueFrom(routerStore.queryParams$)
          ).resolves.toEqual(expectedQueryParameters);
          await expect(
            firstValueFrom(activatedRoute.queryParams)
          ).resolves.toEqual(expectedQueryParameters);
        });
      }
    );
  });
});
