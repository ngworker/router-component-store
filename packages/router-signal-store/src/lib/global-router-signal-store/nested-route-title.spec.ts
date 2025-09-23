import { ResolveFn, RouterConfigOptions, Routes } from '@angular/router';
import { RouterSignalStore } from '../router-signal-store';
import { GlobalRouterSignalStore } from './global-router-signal-store';
import { globalRouterSignalStoreSetup } from './test-util/global-router-signal-store-setup';
import {
  GlobalRouterSignalStoreTestChildComponent,
  GlobalRouterSignalStoreTestGrandchildComponent,
  GlobalRouterSignalStoreTestParentComponent,
} from './test-util/global-router-signal-store-test-components';

const shadowedTitleResolver: ResolveFn<string> = (route) =>
  route.data['shadowed'];

const routes: Routes = [
  {
    path: 'parent',
    component: GlobalRouterSignalStoreTestParentComponent,
    data: {
      parent: 'parent-route-data',
      shadowed: 'parent-route-title',
    },
    title: shadowedTitleResolver,
    children: [
      {
        path: 'child',
        component: GlobalRouterSignalStoreTestChildComponent,
        data: {
          child: 'child-route-data',
          shadowed: 'child-route-title',
        },
        title: shadowedTitleResolver,
        children: [
          {
            path: 'grandchild',
            component: GlobalRouterSignalStoreTestGrandchildComponent,
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

describe(`${GlobalRouterSignalStore.name} nested route title`, () => {
  describe('Given three layers of routes with components and route title resolvers', () => {
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
      Then the title signal emits the resolved title for the leaf route`,
          async ({ RoutedComponent }) => {
            const expectedTitle = 'grandchild-route-title';
            const { routerSignalStore, ngrxRouterStore, ngrxStore } =
              await globalRouterSignalStoreSetup({
                navigateTo: '/parent/child/grandchild',
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.title()).toBe(expectedTitle);
            expect(ngrxStore.selectSignal(ngrxRouterStore.selectTitle)()).toBe(
              // NOTE(@LayZeeDK) Seems to be a bug in NgRx Router Store
              undefined
            );
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
      Then the title signal emits the resolved title for the leaf route`,
          async ({ RoutedComponent }) => {
            const expectedTitle = 'child-route-title';
            const { routerSignalStore, ngrxRouterStore, ngrxStore } =
              await globalRouterSignalStoreSetup({
                navigateTo: '/parent/child',
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.title()).toBe(expectedTitle);
            expect(ngrxStore.selectSignal(ngrxRouterStore.selectTitle)()).toBe(
              // NOTE(@LayZeeDK) Seems to be a bug in NgRx Router Store
              undefined
            );
          }
        );

        it.each(
          [GlobalRouterSignalStoreTestParentComponent].map(
            (RoutedComponent) => ({ RoutedComponent })
          )
        )(
          `  And ${RouterSignalStore.name} is injected at $RoutedComponent.name
      When the ${GlobalRouterSignalStoreTestParentComponent.name} route is activated
      Then the title signal emits the resolved title for the leaf route`,
          async ({ RoutedComponent }) => {
            const expectedTitle = 'parent-route-title';
            const { routerSignalStore, ngrxRouterStore, ngrxStore } =
              await globalRouterSignalStoreSetup({
                navigateTo: '/parent',
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.title()).toBe(expectedTitle);
            expect(ngrxStore.selectSignal(ngrxRouterStore.selectTitle)()).toBe(
              // NOTE(@LayZeeDK) Seems to be a bug in NgRx Router Store
              undefined
            );
          }
        );
      }
    );
  });
});
