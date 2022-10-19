# @ngworker/router-component-store

Angular Router-connecting NgRx component stores.

## Compatibility

Required peer dependencies:

- Angular >=12.2
- NgRx Component Store >=12.0
- RxJS >=7.2
- TypeScript >=4.3

Published with partial Ivy compilation.

## API

A `RouterComponentStore` service has the following public properties:

| API                                                         | Description                                |
| ----------------------------------------------------------- | ------------------------------------------ |
| currentRoute$: Observable<MinimalActivatedRouteSnapshot>    | Select the current route.                  |
| fragment$: Observable<string \| null>                       | Select the current route fragment.         |
| queryParams$: Observable<Params>                            | Select the current route query parameters. |
| routeData$: Observable<Data>                                | Select the current route data.             |
| routeParams$: Observable<Params>                            | Select the current route parameters.       |
| url$: Observable<string>                                    | Select the current URL.                    |
| selectQueryParam<TValue>(param: string): Observable<TValue> | Select the specified query parameter.      |
| selectRouteParam<TValue>(param: string): Observable<TValue> | Select the specified route paramter.       |

The `RouterComponentStore` dependency is provided either by using either `provideGlobalRouterStore` or `provideLocalRouterStore`.

The _global_ `RouterComponentStore` is never destroyed but can be injected in any class.

The _local_ `RouterComponentStore` requires a component-level provider, follows the
lifecycle of that component, and can be injected in declarables as well as
other component-level services.

### Global router component store

An application-wide router store. Can be injected in any class. Provide
in the root environmnet injector by using `provideGlobalRouterStore`.

Usage:

```ts
// app.module.ts
// (...)
import { provideGlobalRouterStore } from '@ngworker/router-component-store';

@NgModule({
  // (...)
  providers: [provideGlobalRouterStore()],
})
export class AppModule {}
```

```ts
// hero.service.ts
// (...)
import { RouterComponentStore } from '@ngworker/router-component-store';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  activeHeroId$: Observable<string> = this.routerStore.selectQueryParam('id');

  constructor(private routerStore: RouterComponentStore) {}
}
```

```ts
// hero-detail.component.ts
// (...)
import { RouterComponentStore } from '@ngworker/router-component-store';

@Component({
  // (...)
})
export class HeroDetailComponent {
  heroId$: Observable<string> = this.routerStore.selectQueryParam('id');

  constructor(private routerStore: RouterComponentStore) {}
}
```

### Local router component store

A component-level router store. Can be injected in any directive, component,
pipe, or component-level service. Explicitly provided in a component sub-tree
using `Component.providers` or `Component.viewProviders`.

Usage:

```ts
// hero-detail.component.ts
// (...)
import {
  provideLocalRouterStore,
  RouterComponentStore,
} from '@ngworker/router-component-store';

@Component({
  // (...)
  providers: [provideLocalRouterStore()],
})
export class HeroDetailComponent {
  heroId$: Observable<string> = this.routerStore.selectQueryParam('id');

  constructor(private routerStore: RouterComponentStore) {}
}
```
