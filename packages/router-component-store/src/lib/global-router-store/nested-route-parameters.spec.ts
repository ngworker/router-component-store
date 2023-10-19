import { Params, Routes } from '@angular/router';
import { createSelector } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { RouterStore } from '../router-store';
import { GlobalRouterStore } from './global-router-store';
import { globalRouterStoreSetup } from './test-util/global-router-store-setup';
import {
  GlobalRouterStoreTestChildComponent,
  GlobalRouterStoreTestGrandchildComponent,
  GlobalRouterStoreTestParentComponent,
} from './test-util/global-router-store-test-components';

const routes: Routes = [
  {
    path: ':parent',
    component: GlobalRouterStoreTestParentComponent,
    children: [
      {
        path: ':child',
        component: GlobalRouterStoreTestChildComponent,
        children: [
          {
            path: ':grandchild',
            component: GlobalRouterStoreTestGrandchildComponent,
          },
        ],
      },
    ],
  },
];

describe(`${GlobalRouterStore.name} nested route parameters`, () => {
  describe('Given three layers of routes with components and route parameters', () => {
    describe('And the default route parameter inheritance strategy is used', () => {
      it.each(
        [
          GlobalRouterStoreTestParentComponent,
          GlobalRouterStoreTestChildComponent,
          GlobalRouterStoreTestGrandchildComponent,
        ].map((RoutedComponent) => ({ RoutedComponent }))
      )(
        `  And ${RouterStore.name} is injected at $RoutedComponent.name
      When the ${GlobalRouterStoreTestGrandchildComponent.name} route is activated
      Then route parameters for the ${GlobalRouterStoreTestGrandchildComponent.name} route are emitted`,
        async ({ RoutedComponent }) => {
          expect.assertions(4);
          const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
            await globalRouterStoreSetup({
              navigateTo:
                '/parent-route-parameter;shadowed=parent-route-parameter/child-route-parameter;shadowed=child-route-parameter/grandchild-route-parameter;shadowed=grandchild-route-parameter',
              RoutedComponent,
              routes,
            });

          const expectedRouteParameters: Params = {
            grandchild: 'grandchild-route-parameter',
            shadowed: 'grandchild-route-parameter',
          };
          await expect(
            firstValueFrom(routerStore.routeParams$)
          ).resolves.toEqual(expectedRouteParameters);
          await expect(
            firstValueFrom(ngrxStore.select(ngrxRouterStore.selectRouteParams))
          ).resolves.toEqual(expectedRouteParameters);
          await expect(
            firstValueFrom(
              componentStore.select({
                grandchild: routerStore.selectRouteParam('grandchild'),
                shadowed: routerStore.selectRouteParam('shadowed'),
              })
            )
          ).resolves.toEqual(expectedRouteParameters);
          await expect(
            firstValueFrom(
              ngrxStore.select(
                createSelector(
                  ngrxRouterStore.selectRouteParam('grandchild'),
                  ngrxRouterStore.selectRouteParam('shadowed'),
                  (grandchild, shadowed) => ({ grandchild, shadowed })
                )
              )
            )
          ).resolves.toEqual(expectedRouteParameters);
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
      Then route parameters for the ${GlobalRouterStoreTestChildComponent.name} route are emitted`,
        async ({ RoutedComponent }) => {
          expect.assertions(4);
          const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
            await globalRouterStoreSetup({
              navigateTo:
                '/parent-route-parameter;shadowed=grandchild-route-parameter/child-route-parameter;shadowed=child-route-parameter',
              RoutedComponent,
              routes,
            });

          const expectedRouteParameters: Params = {
            child: 'child-route-parameter',
            shadowed: 'child-route-parameter',
          };
          await expect(
            firstValueFrom(routerStore.routeParams$)
          ).resolves.toEqual(expectedRouteParameters);
          await expect(
            firstValueFrom(ngrxStore.select(ngrxRouterStore.selectRouteParams))
          ).resolves.toEqual(expectedRouteParameters);
          await expect(
            firstValueFrom(
              componentStore.select({
                child: routerStore.selectRouteParam('child'),
                shadowed: routerStore.selectRouteParam('shadowed'),
              })
            )
          ).resolves.toEqual(expectedRouteParameters);
          await expect(
            firstValueFrom(
              ngrxStore.select(
                createSelector(
                  ngrxRouterStore.selectRouteParam('child'),
                  ngrxRouterStore.selectRouteParam('shadowed'),
                  (child, shadowed) => ({ child, shadowed })
                )
              )
            )
          ).resolves.toEqual(expectedRouteParameters);
        }
      );

      it(`  And ${RouterStore.name} is injected at ${GlobalRouterStoreTestGrandchildComponent.name}
      When the ${GlobalRouterStoreTestGrandchildComponent.name} route is activated
      Then route parameters for the ${GlobalRouterStoreTestGrandchildComponent.name} route are emitted`, async () => {
        expect.assertions(4);
        const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
          await globalRouterStoreSetup({
            navigateTo:
              '/parent-route-parameter;shadowed=parent-route-parameter',
            RoutedComponent: GlobalRouterStoreTestParentComponent,
            routes,
          });

        const expectedRouteParameters: Params = {
          parent: 'parent-route-parameter',
          shadowed: 'parent-route-parameter',
        };
        await expect(firstValueFrom(routerStore.routeParams$)).resolves.toEqual(
          expectedRouteParameters
        );
        await expect(
          firstValueFrom(ngrxStore.select(ngrxRouterStore.selectRouteParams))
        ).resolves.toEqual(expectedRouteParameters);
        await expect(
          firstValueFrom(
            componentStore.select({
              parent: routerStore.selectRouteParam('parent'),
              shadowed: routerStore.selectRouteParam('shadowed'),
            })
          )
        ).resolves.toEqual(expectedRouteParameters);
        await expect(
          firstValueFrom(
            ngrxStore.select(
              createSelector(
                ngrxRouterStore.selectRouteParam('parent'),
                ngrxRouterStore.selectRouteParam('shadowed'),
                (parent, shadowed) => ({ parent, shadowed })
              )
            )
          )
        ).resolves.toEqual(expectedRouteParameters);
      });
    });

    describe('And the "always" route parameter inheritance strategy is used', () => {
      it.each(
        [
          GlobalRouterStoreTestParentComponent,
          GlobalRouterStoreTestChildComponent,
          GlobalRouterStoreTestGrandchildComponent,
        ].map((RoutedComponent) => ({ RoutedComponent }))
      )(
        `  And ${RouterStore.name} is injected at $RoutedComponent.name
      When the ${GlobalRouterStoreTestGrandchildComponent.name} route is activated
      Then route data for the ${GlobalRouterStoreTestGrandchildComponent.name} route are emitted
        And route parameters for the ${GlobalRouterStoreTestChildComponent.name} route are emitted
        And route parameters for the ${GlobalRouterStoreTestParentComponent.name} route are emitted
        And route parameters are merged top-down`,
        async ({ RoutedComponent }) => {
          expect.assertions(4);
          const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
            await globalRouterStoreSetup({
              navigateTo:
                '/parent-route-parameter;shadowed=parent-route-parameter/child-route-parameter;shadowed=child-route-parameter/grandchild-route-parameter;shadowed=grandchild-route-parameter',
              paramsInheritanceStrategy: 'always',
              RoutedComponent,
              routes,
            });

          const expectedRouteParameters: Params = {
            parent: 'parent-route-parameter',
            child: 'child-route-parameter',
            grandchild: 'grandchild-route-parameter',
            shadowed: 'grandchild-route-parameter',
          };
          await expect(
            firstValueFrom(routerStore.routeParams$)
          ).resolves.toEqual(expectedRouteParameters);
          await expect(
            firstValueFrom(ngrxStore.select(ngrxRouterStore.selectRouteParams))
          ).resolves.toEqual(expectedRouteParameters);
          await expect(
            firstValueFrom(
              componentStore.select({
                parent: routerStore.selectRouteParam('parent'),
                child: routerStore.selectRouteParam('child'),
                grandchild: routerStore.selectRouteParam('grandchild'),
                shadowed: routerStore.selectRouteParam('shadowed'),
              })
            )
          ).resolves.toEqual(expectedRouteParameters);
          await expect(
            firstValueFrom(
              ngrxStore.select(
                createSelector(
                  ngrxRouterStore.selectRouteParam('parent'),
                  ngrxRouterStore.selectRouteParam('child'),
                  ngrxRouterStore.selectRouteParam('grandchild'),
                  ngrxRouterStore.selectRouteParam('shadowed'),
                  (parent, child, grandchild, shadowed) => ({
                    parent,
                    child,
                    grandchild,
                    shadowed,
                  })
                )
              )
            )
          ).resolves.toEqual(expectedRouteParameters);
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
      Then route data for the ${GlobalRouterStoreTestChildComponent.name} route are emitted
        And route data for the ${GlobalRouterStoreTestParentComponent.name} route are emitted
        And route data is merged top-down`,
        async ({ RoutedComponent }) => {
          expect.assertions(4);
          const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
            await globalRouterStoreSetup({
              navigateTo:
                '/parent-route-parameter;shadowed=parent-route-parameter/child-route-parameter;shadowed=child-route-parameter',
              paramsInheritanceStrategy: 'always',
              RoutedComponent,
              routes,
            });

          const expectedRouteParameters: Params = {
            parent: 'parent-route-parameter',
            child: 'child-route-parameter',
            shadowed: 'child-route-parameter',
          };
          await expect(
            firstValueFrom(routerStore.routeParams$)
          ).resolves.toEqual(expectedRouteParameters);
          await expect(
            firstValueFrom(ngrxStore.select(ngrxRouterStore.selectRouteParams))
          ).resolves.toEqual(expectedRouteParameters);
          await expect(
            firstValueFrom(
              componentStore.select({
                parent: routerStore.selectRouteParam('parent'),
                child: routerStore.selectRouteParam('child'),
                shadowed: routerStore.selectRouteParam('shadowed'),
              })
            )
          ).resolves.toEqual(expectedRouteParameters);
          await expect(
            firstValueFrom(
              ngrxStore.select(
                createSelector(
                  ngrxRouterStore.selectRouteParam('parent'),
                  ngrxRouterStore.selectRouteParam('child'),
                  ngrxRouterStore.selectRouteParam('shadowed'),
                  (parent, child, shadowed) => ({ parent, child, shadowed })
                )
              )
            )
          ).resolves.toEqual(expectedRouteParameters);
        }
      );

      it(`And ${RouterStore.name} is injected at ${GlobalRouterStoreTestParentComponent.name}
      When the ${GlobalRouterStoreTestParentComponent.name} route is activated
      Then route data for the ${GlobalRouterStoreTestGrandchildComponent.name} route is emitted
        And route data for the ${GlobalRouterStoreTestChildComponent.name} route is emitted
        And route data for the ${GlobalRouterStoreTestParentComponent.name} route is emitted`, async () => {
        expect.assertions(4);
        const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
          await globalRouterStoreSetup({
            navigateTo:
              '/parent-route-parameter;shadowed=parent-route-parameter',
            paramsInheritanceStrategy: 'always',
            RoutedComponent: GlobalRouterStoreTestParentComponent,
            routes,
          });

        const expectedRouteParameters: Params = {
          parent: 'parent-route-parameter',
          shadowed: 'parent-route-parameter',
        };
        await expect(firstValueFrom(routerStore.routeParams$)).resolves.toEqual(
          expectedRouteParameters
        );
        await expect(
          firstValueFrom(ngrxStore.select(ngrxRouterStore.selectRouteParams))
        ).resolves.toEqual(expectedRouteParameters);
        await expect(
          firstValueFrom(
            componentStore.select({
              parent: routerStore.selectRouteParam('parent'),
              shadowed: routerStore.selectRouteParam('shadowed'),
            })
          )
        ).resolves.toEqual(expectedRouteParameters);
        await expect(
          firstValueFrom(
            ngrxStore.select(
              createSelector(
                ngrxRouterStore.selectRouteParam('parent'),
                ngrxRouterStore.selectRouteParam('shadowed'),
                (parent, shadowed) => ({ parent, shadowed })
              )
            )
          )
        ).resolves.toEqual(expectedRouteParameters);
      });
    });
  });
});
