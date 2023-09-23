import { Injector, Type } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, RouterConfigOptions, Routes } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { createFeatureHarness } from '@ngworker/spectacular';
import { RouterStore } from '../../router-store';

export async function localRouterStoreSetup<TRoutedComponent>({
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
    featurePath: 'parent',
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
    get activatedRoute(): ActivatedRoute {
      return injectorFor(RoutedComponent).get(ActivatedRoute);
    },
    get componentStore(): ComponentStore<object> {
      return injectorFor(RoutedComponent).get(ComponentStore, undefined, {
        optional: false,
      });
    },
    get routerStore(): RouterStore {
      return injectorFor(RoutedComponent).get(RouterStore, undefined, {
        optional: false,
        host: true,
      });
    },
  };
}
