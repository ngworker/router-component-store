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

const expectedUrls = {
  parent: '/parent?query=param#fragment',
  child: '/parent/child?query=param#fragment',
  grandchild: '/parent/child/grandchild?query=param#fragment',
} as const;

describe(`${GlobalRouterSignalStore.name} nested route URL`, () => {
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
      Then the URL signal emits the complete URL`,
          async ({ RoutedComponent }) => {
            const expectedUrl = expectedUrls.grandchild;
            const { routerSignalStore, ngrxRouterStore, ngrxStore } =
              await globalRouterSignalStoreSetup({
                navigateTo: '/parent/child/grandchild?query=param#fragment',
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.url()).toBe(expectedUrl);
            expect(ngrxStore.selectSignal(ngrxRouterStore.selectUrl)()).toBe(
              expectedUrl
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
      Then the URL signal emits the complete URL`,
          async ({ RoutedComponent }) => {
            const expectedUrl = expectedUrls.child;
            const { routerSignalStore, ngrxRouterStore, ngrxStore } =
              await globalRouterSignalStoreSetup({
                navigateTo: '/parent/child?query=param#fragment',
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.url()).toBe(expectedUrl);
            expect(ngrxStore.selectSignal(ngrxRouterStore.selectUrl)()).toBe(
              expectedUrl
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
      Then the URL signal emits the complete URL`,
          async ({ RoutedComponent }) => {
            const expectedUrl = expectedUrls.parent;
            const { routerSignalStore, ngrxRouterStore, ngrxStore } =
              await globalRouterSignalStoreSetup({
                navigateTo: '/parent?query=param#fragment',
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.url()).toBe(expectedUrl);
            expect(ngrxStore.selectSignal(ngrxRouterStore.selectUrl)()).toBe(
              expectedUrl
            );
          }
        );
      }
    );
  });
});
