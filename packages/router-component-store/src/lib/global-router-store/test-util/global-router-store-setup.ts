import { Injector, Type } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RouterConfigOptions, Routes } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import {
  DEFAULT_ROUTER_FEATURENAME,
  getRouterSelectors,
  provideRouterStore,
  routerReducer,
} from '@ngrx/router-store';
import { provideStore, Store } from '@ngrx/store';
import { createFeatureHarness } from '@ngworker/spectacular';
import { RouterStore } from '../../router-store';
import { provideGlobalRouterStore } from '../provide-global-router-store';

export async function globalRouterStoreSetup<TRoutedComponent>({
  navigateTo,
  paramsInheritanceStrategy,
  RoutedComponent,
  routes,
}: {
  readonly navigateTo: string;
  readonly paramsInheritanceStrategy?: NonNullable<
    RouterConfigOptions['paramsInheritanceStrategy']
  >;
  readonly RoutedComponent: Type<TRoutedComponent>;
  readonly routes: Routes;
}) {
  const harness = createFeatureHarness({
    providers: [
      provideGlobalRouterStore(),
      // We compare `GlobalRouterStore` to NgRx Router Store selectors
      provideStore({
        [DEFAULT_ROUTER_FEATURENAME]: routerReducer,
      }),
      provideRouterStore(),
      ComponentStore,
    ],
    featurePath: '',
    routes,
    routerOptions: {
      paramsInheritanceStrategy,
    },
  });
  const injectorFor = <TComponent>(ComponentType: Type<TComponent>): Injector =>
    harness.rootFixture.debugElement.query(By.directive(ComponentType))
      .injector;

  await harness.router.navigateByUrl(navigateTo);

  return {
    get componentStore(): ComponentStore<object> {
      return injectorFor(RoutedComponent).get(ComponentStore, undefined, {
        optional: false,
      });
    },
    get ngrxRouterStore(): ReturnType<typeof getRouterSelectors> {
      return getRouterSelectors();
    },
    get ngrxStore(): Store<object> {
      return injectorFor(RoutedComponent).get(Store);
    },
    get routerStore(): RouterStore {
      return injectorFor(RoutedComponent).get(RouterStore, undefined, {
        optional: false,
        skipSelf: true,
      });
    },
  };
}
