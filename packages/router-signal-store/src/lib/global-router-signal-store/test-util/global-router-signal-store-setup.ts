import { Injector, Type } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RouterConfigOptions, Routes } from '@angular/router';
import {
  DEFAULT_ROUTER_FEATURENAME,
  getRouterSelectors,
  provideRouterStore,
  routerReducer,
} from '@ngrx/router-store';
import { provideStore, Store } from '@ngrx/store';
import { createFeatureHarness } from '@ngworker/spectacular';
import { RouterSignalStore } from '../../router-signal-store';
import { provideGlobalRouterSignalStore } from '../provide-global-router-signal-store';

export async function globalRouterSignalStoreSetup<TRoutedComponent>({
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
      provideGlobalRouterSignalStore(),
      // We compare `GlobalRouterSignalStore` to NgRx Router Store selectors
      provideStore({
        [DEFAULT_ROUTER_FEATURENAME]: routerReducer,
      }),
      provideRouterStore(),
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
    get ngrxRouterStore(): ReturnType<typeof getRouterSelectors> {
      return getRouterSelectors();
    },
    get ngrxStore(): Store<object> {
      return injectorFor(RoutedComponent).get(Store);
    },
    get routerSignalStore(): RouterSignalStore {
      return injectorFor(RoutedComponent).get(RouterSignalStore, undefined, {
        optional: false,
        skipSelf: true,
      });
    },
  };
}
