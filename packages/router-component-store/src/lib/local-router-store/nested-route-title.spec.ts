import { ResolveFn, RouterConfigOptions, Routes } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RouterStore } from '../router-store';
import { LocalRouterStore } from './local-router-store';
import { localRouterStoreSetup } from './test-util/local-router-store-setup';
import {
  LocalRouterStoreTestChildComponent,
  LocalRouterStoreTestGrandchildComponent,
  LocalRouterStoreTestParentComponent,
} from './test-util/local-router-store-test-components';

const shadowedTitleResolver: ResolveFn<string> = (route) =>
  route.data['shadowed'];

const routes: Routes = [
  {
    path: 'parent',
    component: LocalRouterStoreTestParentComponent,
    data: {
      parent: 'parent-route-data',
      shadowed: 'parent-route-title',
    },
    title: shadowedTitleResolver,
    children: [
      {
        path: 'child',
        component: LocalRouterStoreTestChildComponent,
        data: {
          child: 'child-route-data',
          shadowed: 'child-route-title',
        },
        title: shadowedTitleResolver,
        children: [
          {
            path: 'grandchild',
            component: LocalRouterStoreTestGrandchildComponent,
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

describe(`${LocalRouterStore.name} nested route title`, () => {
  describe('Given three layers of routes with components and route title resolvers', () => {
    const paramsInheritanceStrategies: RouterConfigOptions['paramsInheritanceStrategy'][] =
      ['always', 'emptyOnly'];

    describe.each(paramsInheritanceStrategies)(
      '  And the "%s" route parameter inheritance strategy is used',
      (paramsInheritanceStrategy) => {
        it.each(['/parent/child/grandchild', '/parent/child', '/parent'])(
          `  And ${RouterStore.name} is injected at ${LocalRouterStoreTestParentComponent.name}
        When the "%s" route is activated
        Then the route title for the ${LocalRouterStoreTestParentComponent.name} route is emitted`,
          async (navigateTo) => {
            expect.assertions(2);
            const { activatedRoute, routerStore } = await localRouterStoreSetup(
              {
                navigateTo,
                paramsInheritanceStrategy,
                RoutedComponent: LocalRouterStoreTestParentComponent,
                routes,
              }
            );

            const expectedTitle = 'parent-route-title';
            await expect(firstValueFrom(routerStore.title$)).resolves.toEqual(
              expectedTitle
            );
            await expect(firstValueFrom(activatedRoute.title)).resolves.toEqual(
              expectedTitle
            );
          }
        );
      }
    );

    describe('And the default route parameter inheritance strategy is used', () => {
      it.each(['/parent/child/grandchild', '/parent/child'])(
        `  And ${RouterStore.name} is injected at ${LocalRouterStoreTestChildComponent.name}
      When the "%s" route is activated
      Then the route title for the ${LocalRouterStoreTestChildComponent.name} route is emitted`,
        async (navigateTo) => {
          expect.assertions(2);
          const { activatedRoute, routerStore } = await localRouterStoreSetup({
            navigateTo,
            RoutedComponent: LocalRouterStoreTestChildComponent,
            routes,
          });

          const expectedTitle = 'child-route-title';
          await expect(firstValueFrom(routerStore.title$)).resolves.toEqual(
            expectedTitle
          );
          await expect(firstValueFrom(activatedRoute.title)).resolves.toEqual(
            expectedTitle
          );
        }
      );

      it(`  And ${RouterStore.name} is injected at ${LocalRouterStoreTestGrandchildComponent.name}
      When the ${LocalRouterStoreTestGrandchildComponent.name} route is activated
      Then the route title for the ${LocalRouterStoreTestGrandchildComponent.name} route is emitted`, async () => {
        expect.assertions(2);
        const { activatedRoute, routerStore } = await localRouterStoreSetup({
          navigateTo: '/parent/child/grandchild',
          RoutedComponent: LocalRouterStoreTestGrandchildComponent,
          routes,
        });

        const expectedTitle = 'grandchild-route-title';
        await expect(firstValueFrom(routerStore.title$)).resolves.toEqual(
          expectedTitle
        );
        await expect(firstValueFrom(activatedRoute.title)).resolves.toEqual(
          expectedTitle
        );
      });
    });

    describe('And the "always" route parameter inheritance strategy is used', () => {
      it.each(['/parent/child/grandchild', '/parent/child'])(
        `  And ${RouterStore.name} is injected at ${LocalRouterStoreTestChildComponent.name}
      When the "%s" route is activated
      Then the route title for the ${LocalRouterStoreTestChildComponent.name} route is emitted`,
        async (navigateTo) => {
          expect.assertions(2);
          const { activatedRoute, routerStore } = await localRouterStoreSetup({
            navigateTo,
            paramsInheritanceStrategy: 'always',
            RoutedComponent: LocalRouterStoreTestChildComponent,
            routes,
          });

          const expectedTitle = 'child-route-title';
          await expect(firstValueFrom(routerStore.title$)).resolves.toEqual(
            expectedTitle
          );
          await expect(firstValueFrom(activatedRoute.title)).resolves.toEqual(
            expectedTitle
          );
        }
      );

      it(`  And ${RouterStore.name} is injected at ${LocalRouterStoreTestGrandchildComponent.name}
      When the ${LocalRouterStoreTestGrandchildComponent.name} route is activated
      Then the route title for the ${LocalRouterStoreTestGrandchildComponent.name}`, async () => {
        expect.assertions(2);
        const { activatedRoute, routerStore } = await localRouterStoreSetup({
          navigateTo: '/parent/child/grandchild',
          paramsInheritanceStrategy: 'always',
          RoutedComponent: LocalRouterStoreTestGrandchildComponent,
          routes,
        });

        const expectedTitle = 'grandchild-route-title';
        await expect(firstValueFrom(routerStore.title$)).resolves.toEqual(
          expectedTitle
        );
        await expect(firstValueFrom(activatedRoute.title)).resolves.toEqual(
          expectedTitle
        );
      });
    });
  });
});
