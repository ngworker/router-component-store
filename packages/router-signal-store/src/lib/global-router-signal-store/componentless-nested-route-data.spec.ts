import { RouterConfigOptions, Routes } from '@angular/router';
import { RouterSignalStore } from '../router-signal-store';
import { StrictRouteData } from '../strict-route-data';
import { GlobalRouterSignalStore } from './global-router-signal-store';
import { globalRouterSignalStoreSetup } from './test-util/global-router-signal-store-setup';
import {
  GlobalRouterSignalStoreTestChildComponent,
  GlobalRouterSignalStoreTestGrandchildComponent,
  GlobalRouterSignalStoreTestParentComponent,
} from './test-util/global-router-signal-store-test-components';

const routes: Routes = [
  {
    path: '',
    data: {
      componentlessBeforeParent: 'componentless-route-data-before-parent',
      shadowed: 'componentless-route-data-before-parent',
    },
    children: [
      {
        path: 'parent',
        component: GlobalRouterSignalStoreTestParentComponent,
        data: {
          parent: 'parent-route-data',
          shadowed: 'parent-route-data',
        },
        children: [
          {
            path: '',
            data: {
              componentlessBeforeChild: 'componentless-route-data-before-child',
              shadowed: 'componentless-route-data-before-child',
            },
            children: [
              {
                path: 'child',
                component: GlobalRouterSignalStoreTestChildComponent,
                data: {
                  child: 'child-route-data',
                  shadowed: 'child-route-data',
                },
                children: [
                  {
                    path: '',
                    data: {
                      componentlessBeforeGrandchild:
                        'componentless-route-data-before-grandchild',
                      shadowed: 'componentless-route-data-before-grandchild',
                    },
                    children: [
                      {
                        path: 'grandchild',
                        component:
                          GlobalRouterSignalStoreTestGrandchildComponent,
                        data: {
                          grandchild: 'grandchild-route-data',
                          shadowed: 'grandchild-route-data',
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

describe(`${GlobalRouterSignalStore.name} componentless nested route data`, () => {
  describe('Given nested routes with componentless routes containing route data', () => {
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
      Then the route data signal emits the leaf route data`,
          async ({ RoutedComponent }) => {
            const expectedRouteData: StrictRouteData = {
              grandchild: 'grandchild-route-data',
              shadowed: 'grandchild-route-data',
              componentlessBeforeParent:
                'componentless-route-data-before-parent',
              parent: 'parent-route-data',
              componentlessBeforeChild: 'componentless-route-data-before-child',
              child: 'child-route-data',
              componentlessBeforeGrandchild:
                'componentless-route-data-before-grandchild',
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
      Then the specific route data parameter signals emit the expected values`,
          async ({ RoutedComponent }) => {
            const { routerSignalStore, ngrxRouterStore, ngrxStore } =
              await globalRouterSignalStoreSetup({
                navigateTo: '/parent/child/grandchild',
                paramsInheritanceStrategy,
                RoutedComponent,
                routes,
              });

            expect(routerSignalStore.selectRouteDataParam('grandchild')()).toBe(
              'grandchild-route-data'
            );
            expect(
              ngrxStore.selectSignal(
                ngrxRouterStore.selectRouteDataParam('grandchild')
              )()
            ).toBe('grandchild-route-data');

            expect(routerSignalStore.selectRouteDataParam('shadowed')()).toBe(
              'grandchild-route-data'
            );
            expect(
              ngrxStore.selectSignal(
                ngrxRouterStore.selectRouteDataParam('shadowed')
              )()
            ).toBe('grandchild-route-data');

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
