import { ResolveFn, RouterConfigOptions, Routes } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RouterStore } from '../router-store';
import { GlobalRouterStore } from './global-router-store';
import { globalRouterStoreSetup } from './test-util/global-router-store-setup';
import {
  GlobalRouterStoreTestChildComponent,
  GlobalRouterStoreTestGrandchildComponent,
  GlobalRouterStoreTestParentComponent,
} from './test-util/global-router-store-test-components';

const shadowedTitleResolver: ResolveFn<string> = (route) =>
  route.data['shadowed'];

const routes: Routes = [
  {
    path: 'parent',
    component: GlobalRouterStoreTestParentComponent,
    data: {
      parent: 'parent-route-data',
      shadowed: 'parent-route-title',
    },
    title: shadowedTitleResolver,
    children: [
      {
        path: 'child',
        component: GlobalRouterStoreTestChildComponent,
        data: {
          child: 'child-route-data',
          shadowed: 'child-route-title',
        },
        title: shadowedTitleResolver,
        children: [
          {
            path: 'grandchild',
            component: GlobalRouterStoreTestGrandchildComponent,
            data: {
              grandchild: 'grandchild-route-data',
              shadowed: 'grandchild-route-title',
            },
            title: shadowedTitleResolver,
          },
        ],
      },
    ],
  },
];

describe(`${GlobalRouterStore.name} nested route title`, () => {
  describe('Given three layers of routes with components and route title resolvers', () => {
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
      Then the route title for the ${GlobalRouterStoreTestGrandchildComponent.name} route is emitted`,
          async ({ RoutedComponent }) => {
            expect.assertions(2);
            const { ngrxRouterStore, ngrxStore, routerStore } =
              await globalRouterStoreSetup({
                navigateTo: '/parent/child/grandchild',
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            const expectedTitle = 'grandchild-route-title';
            await expect(firstValueFrom(routerStore.title$)).resolves.toBe(
              expectedTitle
            );
            await expect(
              firstValueFrom(ngrxStore.select(ngrxRouterStore.selectTitle))
            ).resolves.toBe(
              // NOTE(@LayZeeDK) Seems to be a bug in NgRx Router Store 15.0.0
              undefined
            );
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
      Then route title for the ${GlobalRouterStoreTestChildComponent.name} route is emitted`,
          async ({ RoutedComponent }) => {
            expect.assertions(2);
            const { ngrxRouterStore, ngrxStore, routerStore } =
              await globalRouterStoreSetup({
                navigateTo: '/parent/child',
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            const expectedTitle = 'child-route-title';
            await expect(firstValueFrom(routerStore.title$)).resolves.toBe(
              expectedTitle
            );
            await expect(
              firstValueFrom(ngrxStore.select(ngrxRouterStore.selectTitle))
            ).resolves.toBe(
              // NOTE(@LayZeeDK) Seems to be a bug in NgRx Router Store 15.0.0
              undefined
            );
          }
        );

        it(`  And ${RouterStore.name} is injected at ${GlobalRouterStoreTestParentComponent.name}
      When the ${GlobalRouterStoreTestParentComponent.name} route is activated
      Then route title for the ${GlobalRouterStoreTestParentComponent.name} route is emitted`, async () => {
          expect.assertions(2);
          const { ngrxRouterStore, ngrxStore, routerStore } =
            await globalRouterStoreSetup({
              navigateTo: '/parent',
              paramsInheritanceStrategy,
              RoutedComponent: GlobalRouterStoreTestParentComponent,
              routes,
            });

          const expectedTitle = 'parent-route-title';
          await expect(firstValueFrom(routerStore.title$)).resolves.toBe(
            expectedTitle
          );
          await expect(
            firstValueFrom(ngrxStore.select(ngrxRouterStore.selectTitle))
          ).resolves.toBe(
            // NOTE(@LayZeeDK) Seems to be a bug in NgRx Router Store 15.0.0
            undefined
          );
        });
      }
    );
  });
});
