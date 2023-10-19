import { Params, Routes } from '@angular/router';
import { createSelector } from '@ngrx/store';
import { debounceTime, firstValueFrom } from 'rxjs';
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
    path: ':componentlessBeforeParent',
    children: [
      {
        path: ':parent',
        component: GlobalRouterStoreTestParentComponent,
        children: [
          {
            path: ':componentlessBeforeChild',
            children: [
              {
                path: ':child',
                component: GlobalRouterStoreTestChildComponent,
                children: [
                  {
                    path: ':componentlessBeforeGrandchild',
                    children: [
                      {
                        path: ':grandchild',
                        component: GlobalRouterStoreTestGrandchildComponent,
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

describe(`${GlobalRouterStore.name} componentless nested route parameters`, () => {
  describe(`Given three layers of routes with components and route parameters
    And a componentless route with route parameters before each of them`, () => {
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
      Then route parameters for the ${GlobalRouterStoreTestGrandchildComponent.name} route are emitted
        And componentless route parameters before the ${GlobalRouterStoreTestGrandchildComponent.name} route are emitted`,
        async ({ RoutedComponent }) => {
          expect.assertions(4);
          const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
            await globalRouterStoreSetup({
              navigateTo:
                'componentless-route-parameter-before-parent;shadowed=componentless-route-parameter-before-parent/parent-route-parameter;shadowed=parent-route-parameter/componentless-route-parameter-before-child;shadowed=componentless-route-parameter-before-child/child-route-parameter;shadowed=child-route-parameter/componentless-route-parameter-before-grandchild;shadowed=componentless-route-parameter-before-grandchild/grandchild-route-parameter;shadowed=grandchild-route-parameter',
              RoutedComponent,
              routes,
            });

          const expectedRouteParameters: Params = {
            componentlessBeforeGrandchild:
              'componentless-route-parameter-before-grandchild',
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
              componentStore.select(
                {
                  componentlessBeforeGrandchild: routerStore.selectRouteParam(
                    'componentlessBeforeGrandchild'
                  ),
                  grandchild: routerStore.selectRouteParam('grandchild'),
                  shadowed: routerStore.selectRouteParam('shadowed'),
                },
                {
                  debounce: true,
                }
              )
            )
          ).resolves.toEqual(expectedRouteParameters);
          await expect(
            firstValueFrom(
              ngrxStore
                .select(
                  createSelector(
                    ngrxRouterStore.selectRouteParam(
                      'componentlessBeforeGrandchild'
                    ),
                    ngrxRouterStore.selectRouteParam('grandchild'),
                    ngrxRouterStore.selectRouteParam('shadowed'),
                    (componentlessBeforeGrandchild, grandchild, shadowed) => ({
                      componentlessBeforeGrandchild,
                      grandchild,
                      shadowed,
                    })
                  )
                )
                .pipe(debounceTime(0))
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
      Then route parameters for the ${GlobalRouterStoreTestChildComponent.name} route are emitted
        And componentless route parameters before the ${GlobalRouterStoreTestChildComponent.name} route are emitted`,
        async ({ RoutedComponent }) => {
          expect.assertions(4);
          const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
            await globalRouterStoreSetup({
              navigateTo:
                'componentless-route-parameter-before-parent;shadowed=componentless-route-parameter-before-parent/parent-route-parameter;shadowed=parent-route-parameter/componentless-route-parameter-before-child;shadowed=componentless-route-parameter-before-child/child-route-parameter;shadowed=child-route-parameter',
              RoutedComponent,
              routes,
            });

          const expectedRouteParameters: Params = {
            componentlessBeforeChild:
              'componentless-route-parameter-before-child',
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
              componentStore.select(
                {
                  componentlessBeforeChild: routerStore.selectRouteParam(
                    'componentlessBeforeChild'
                  ),
                  child: routerStore.selectRouteParam('child'),
                  shadowed: routerStore.selectRouteParam('shadowed'),
                },
                {
                  debounce: true,
                }
              )
            )
          ).resolves.toEqual(expectedRouteParameters);
          await expect(
            firstValueFrom(
              ngrxStore
                .select(
                  createSelector(
                    ngrxRouterStore.selectRouteParam(
                      'componentlessBeforeChild'
                    ),
                    ngrxRouterStore.selectRouteParam('child'),
                    ngrxRouterStore.selectRouteParam('shadowed'),
                    (componentlessBeforeChild, child, shadowed) => ({
                      componentlessBeforeChild,
                      child,
                      shadowed,
                    })
                  )
                )
                .pipe(debounceTime(0))
            )
          ).resolves.toEqual(expectedRouteParameters);
        }
      );

      it(`  And ${RouterStore.name} is injected at ${GlobalRouterStoreTestParentComponent.name}
      When the ${GlobalRouterStoreTestParentComponent.name} route is activated
      Then route parameters for the ${GlobalRouterStoreTestGrandchildComponent.name} route are emitted
        And componentless route parameters before the ${GlobalRouterStoreTestParentComponent.name} route are emitted`, async () => {
        expect.assertions(4);
        const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
          await globalRouterStoreSetup({
            navigateTo:
              'componentless-route-parameter-before-parent;shadowed=componentless-route-parameter-before-parent/parent-route-parameter;shadowed=parent-route-parameter',
            RoutedComponent: GlobalRouterStoreTestParentComponent,
            routes,
          });

        const expectedRouteParameters: Params = {
          componentlessBeforeParent:
            'componentless-route-parameter-before-parent',
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
            componentStore.select(
              {
                componentlessBeforeParent: routerStore.selectRouteParam(
                  'componentlessBeforeParent'
                ),
                parent: routerStore.selectRouteParam('parent'),
                shadowed: routerStore.selectRouteParam('shadowed'),
              },
              {
                debounce: true,
              }
            )
          )
        ).resolves.toEqual(expectedRouteParameters);
        await expect(
          firstValueFrom(
            ngrxStore
              .select(
                createSelector(
                  ngrxRouterStore.selectRouteParam('componentlessBeforeParent'),
                  ngrxRouterStore.selectRouteParam('parent'),
                  ngrxRouterStore.selectRouteParam('shadowed'),
                  (componentlessBeforeParent, parent, shadowed) => ({
                    componentlessBeforeParent,
                    parent,
                    shadowed,
                  })
                )
              )
              .pipe(debounceTime(0))
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
      Then route parameters for the ${GlobalRouterStoreTestGrandchildComponent.name} route are emitted
        And componentless route parameters before the ${GlobalRouterStoreTestGrandchildComponent.name} route are emitted
        And route parameters for the ${GlobalRouterStoreTestChildComponent.name} route are emitted
        And componentless route parameters before the ${GlobalRouterStoreTestChildComponent.name} route are emitted
        And route parameters for the ${GlobalRouterStoreTestParentComponent.name} route are emitted
        And componentless route parameters before the ${GlobalRouterStoreTestParentComponent.name} route are emitted
        And route parameters are merged top-down`,
        async ({ RoutedComponent }) => {
          expect.assertions(4);
          const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
            await globalRouterStoreSetup({
              navigateTo:
                'componentless-route-parameter-before-parent;shadowed=componentless-route-parameter-before-parent/parent-route-parameter;shadowed=parent-route-parameter/componentless-route-parameter-before-child;shadowed=componentless-route-parameter-before-child/child-route-parameter;shadowed=child-route-parameter/componentless-route-parameter-before-grandchild;shadowed=componentless-route-parameter-before-grandchild/grandchild-route-parameter;shadowed=grandchild-route-parameter',
              paramsInheritanceStrategy: 'always',
              RoutedComponent,
              routes,
            });

          const expectedRouteParameters: Params = {
            componentlessBeforeParent:
              'componentless-route-parameter-before-parent',
            parent: 'parent-route-parameter',
            componentlessBeforeChild:
              'componentless-route-parameter-before-child',
            child: 'child-route-parameter',
            componentlessBeforeGrandchild:
              'componentless-route-parameter-before-grandchild',
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
              componentStore.select(
                {
                  componentlessBeforeParent: routerStore.selectRouteParam(
                    'componentlessBeforeParent'
                  ),
                  parent: routerStore.selectRouteParam('parent'),
                  componentlessBeforeChild: routerStore.selectRouteParam(
                    'componentlessBeforeChild'
                  ),
                  child: routerStore.selectRouteParam('child'),
                  componentlessBeforeGrandchild: routerStore.selectRouteParam(
                    'componentlessBeforeGrandchild'
                  ),
                  grandchild: routerStore.selectRouteParam('grandchild'),
                  shadowed: routerStore.selectRouteParam('shadowed'),
                },
                {
                  debounce: true,
                }
              )
            )
          ).resolves.toEqual(expectedRouteParameters);
          await expect(
            firstValueFrom(
              ngrxStore
                .select(
                  createSelector(
                    ngrxRouterStore.selectRouteParam(
                      'componentlessBeforeParent'
                    ),
                    ngrxRouterStore.selectRouteParam('parent'),
                    ngrxRouterStore.selectRouteParam(
                      'componentlessBeforeChild'
                    ),
                    ngrxRouterStore.selectRouteParam('child'),
                    ngrxRouterStore.selectRouteParam(
                      'componentlessBeforeGrandchild'
                    ),
                    ngrxRouterStore.selectRouteParam('grandchild'),
                    ngrxRouterStore.selectRouteParam('shadowed'),
                    (
                      componentlessBeforeParent,
                      parent,
                      componentlessBeforeChild,
                      child,
                      componentlessBeforeGrandchild,
                      grandchild,
                      shadowed
                    ) => ({
                      componentlessBeforeParent,
                      parent,
                      componentlessBeforeChild,
                      child,
                      componentlessBeforeGrandchild,
                      grandchild,
                      shadowed,
                    })
                  )
                )
                .pipe(debounceTime(0))
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
      Then route parameters for the ${GlobalRouterStoreTestChildComponent.name} route are emitted
        And componentless route parameters before the ${GlobalRouterStoreTestChildComponent.name} route are emitted
        And route parameters for the ${GlobalRouterStoreTestParentComponent.name} route are emitted
        And componentless route parameters before the ${GlobalRouterStoreTestParentComponent.name} route are emitted
        And route parameters are merged top-down`,
        async ({ RoutedComponent }) => {
          expect.assertions(4);
          const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
            await globalRouterStoreSetup({
              navigateTo:
                'componentless-route-parameter-before-parent;shadowed=componentless-route-parameter-before-parent/parent-route-parameter;shadowed=parent-route-parameter/componentless-route-parameter-before-child;shadowed=componentless-route-parameter-before-child/child-route-parameter;shadowed=child-route-parameter',
              paramsInheritanceStrategy: 'always',
              RoutedComponent,
              routes,
            });

          const expectedRouteParameters: Params = {
            componentlessBeforeParent:
              'componentless-route-parameter-before-parent',
            parent: 'parent-route-parameter',
            componentlessBeforeChild:
              'componentless-route-parameter-before-child',
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
              componentStore.select(
                {
                  componentlessBeforeParent: routerStore.selectRouteParam(
                    'componentlessBeforeParent'
                  ),
                  parent: routerStore.selectRouteParam('parent'),
                  componentlessBeforeChild: routerStore.selectRouteParam(
                    'componentlessBeforeChild'
                  ),
                  child: routerStore.selectRouteParam('child'),
                  shadowed: routerStore.selectRouteParam('shadowed'),
                },
                {
                  debounce: true,
                }
              )
            )
          ).resolves.toEqual(expectedRouteParameters);
          await expect(
            firstValueFrom(
              ngrxStore
                .select(
                  createSelector(
                    ngrxRouterStore.selectRouteParam(
                      'componentlessBeforeParent'
                    ),
                    ngrxRouterStore.selectRouteParam('parent'),
                    ngrxRouterStore.selectRouteParam(
                      'componentlessBeforeChild'
                    ),
                    ngrxRouterStore.selectRouteParam('child'),
                    ngrxRouterStore.selectRouteParam('shadowed'),
                    (
                      componentlessBeforeParent,
                      parent,
                      componentlessBeforeChild,
                      child,
                      shadowed
                    ) => ({
                      componentlessBeforeParent,
                      parent,
                      componentlessBeforeChild,
                      child,
                      shadowed,
                    })
                  )
                )
                .pipe(debounceTime(0))
            )
          ).resolves.toEqual(expectedRouteParameters);
        }
      );

      it(`And ${RouterStore.name} is injected at ${GlobalRouterStoreTestParentComponent.name}
      When the ${GlobalRouterStoreTestParentComponent.name} route is activated
      Then route parameters for the ${GlobalRouterStoreTestParentComponent.name} route are emitted
        And componentless route parameters before the ${GlobalRouterStoreTestChildComponent.name} route are emitted`, async () => {
        expect.assertions(4);
        const { componentStore, ngrxRouterStore, ngrxStore, routerStore } =
          await globalRouterStoreSetup({
            navigateTo:
              'componentless-route-parameter-before-parent;shadowed=componentless-route-parameter-before-parent/parent-route-parameter;shadowed=parent-route-parameter',
            paramsInheritanceStrategy: 'always',
            RoutedComponent: GlobalRouterStoreTestParentComponent,
            routes,
          });

        const expectedRouteParameters: Params = {
          componentlessBeforeParent:
            'componentless-route-parameter-before-parent',
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
            componentStore.select(
              {
                componentlessBeforeParent: routerStore.selectRouteParam(
                  'componentlessBeforeParent'
                ),
                parent: routerStore.selectRouteParam('parent'),
                shadowed: routerStore.selectRouteParam('shadowed'),
              },
              {
                debounce: true,
              }
            )
          )
        ).resolves.toEqual(expectedRouteParameters);
        await expect(
          firstValueFrom(
            ngrxStore
              .select(
                createSelector(
                  ngrxRouterStore.selectRouteParam('componentlessBeforeParent'),
                  ngrxRouterStore.selectRouteParam('parent'),
                  ngrxRouterStore.selectRouteParam('shadowed'),
                  (componentlessBeforeParent, parent, shadowed) => ({
                    componentlessBeforeParent,
                    parent,
                    shadowed,
                  })
                )
              )
              .pipe(debounceTime(0))
          )
        ).resolves.toEqual(expectedRouteParameters);
      });
    });
  });
});
