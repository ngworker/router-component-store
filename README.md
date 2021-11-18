# @ngworker/router-component-store

Angular Router-connecting NgRx component stores.

## Compatibility

Required peer dependencies:

- Angular >=12.2
- NgRx Component Store >=12.0
- RxJS >=7.0

Published with partial Ivy compilation.

## API

Two router stores are available and implement the same public API:

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

The `GlobalRouterStore` is never destroyed but can be injected in any class.

The `LocalRouterStore` requires a component-level provider, follows the
lifecycle of that component, and can be injected in declarables as well as
other component-level services.

### GlobalRouterStore

An application-wide router store. Can be injected in any class. Implicitly
provided in the root module injector.

Usage:

```ts
// (...)
import { GlobalRouterStore } from '@ngworker/router-component-store';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  activeHeroId$: Observable<number> = this.routerStore.selectQueryParam('id');

  constructor(private routerStore: GlobalRouterStore) {}
}
```

### LocalRouterStore

A component-level router store. Can be injected in any directive, component,
pipe, or component-level service. Explicitly provided in a component sub-tree
using `Component.providers` or `Component.viewProviders`.

Usage:

```ts
// (...)
import { LocalRouterStore } from '@ngworker/router-component-store';

@Component({
  // (...)
  providers: [LocalRouterStore],
})
export class HeroDetailComponent {
  heroId$: Observable<number> = this.routerStore.selectQueryParam('id');

  constructor(private routerStore: LocalRouterStore) {}
}
```
