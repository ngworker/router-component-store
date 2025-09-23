import { Injector, Type, runInInjectionContext } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, RouterConfigOptions, Routes } from '@angular/router';
import { createFeatureHarness } from '@ngworker/spectacular';
import { RouterSignalStore } from '../../router-signal-store';
import { toSignal as ngToSignal } from '@angular/core/rxjs-interop';

export async function localRouterSignalStoreSetup<TRoutedComponent>({
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

  const toSignal = ((...args: Parameters<typeof ngToSignal>) =>
    runInInjectionContext(injectorFor(RoutedComponent), () =>
      ngToSignal(...args)
    )) as typeof ngToSignal;

  return {
    get activatedRoute(): ActivatedRoute {
      return injectorFor(RoutedComponent).get(ActivatedRoute);
    },
    get routerSignalStore(): RouterSignalStore {
      return injectorFor(RoutedComponent).get(RouterSignalStore, undefined, {
        optional: false,
        host: true,
      });
    },
    toSignal,
  };
}
