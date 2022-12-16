# Router Component Store

[`@ngworker/router-component-store`](https://www.npmjs.com/package/@ngworker/router-component-store)

An Angular Router-connecting NgRx component store.

## Compatibility

Required peer dependencies:

- Angular >=14.0
- NgRx Component Store >=14.0
- RxJS >=7.4
- TypeScript >=4.6

Published with partial Ivy compilation.

## API

A `RouterStore` service has the following public properties:

| API                                                                | Description                                |
| ------------------------------------------------------------------ | ------------------------------------------ |
| `currentRoute$: Observable<MinimalActivatedRouteSnapshot>`         | Select the current route.                  |
| `fragment$: Observable<string \| null>`                            | Select the current route fragment.         |
| `queryParams$: Observable<Params>`                                 | Select the current route query parameters. |
| `routeData$: Observable<Data>`                                     | Select the current route data.             |
| `routeParams$: Observable<Params>`                                 | Select the current route parameters.       |
| `url$: Observable<string>`                                         | Select the current URL.                    |
| `selectQueryParam(param: string): Observable<string \| undefined>` | Select the specified query parameter.      |
| `selectRouteParam(param: string): Observable<string \| undefined>` | Select the specified route parameter.      |

A `RouterStore` service is provided by using either `provideGlobalRouterStore` or `provideLocalRouterStore`.

The _global_ `RouterStore` service is provided in a root environment injector and is never destroyed but can be injected in any class.

A _local_ `RouterStore` requires a component-level provider, follows the
lifecycle of that component, and can be injected in declarables as well as
other component-level services.

### Global router store

An application-wide router store that can be injected in any class. Use
`provideGlobalRouterStore` to provide it in a root environment injector.

Providing in a standalone Angular application:

```typescript
// main.ts
// (...)
import { provideGlobalRouterStore } from '@ngworker/router-component-store';

bootstrapApplication(AppComponent, {
  providers: [provideGlobalRouterStore()],
}).catch((error) => console.error(error));
```

Providing in a classic Angular application:

```typescript
// app.module.ts
// (...)
import { provideGlobalRouterStore } from '@ngworker/router-component-store';

@NgModule({
  // (...)
  providers: [provideGlobalRouterStore()],
})
export class AppModule {}
```

Usage in service:

```typescript
// hero.service.ts
// (...)
import { RouterStore } from '@ngworker/router-component-store';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  #routerStore = inject(RouterStore);

  activeHeroId$: Observable<string | undefined> =
    this.#routerStore.selectRouteParam('id');
}
```

Usage in component:

```typescript
// hero-detail.component.ts
// (...)
import { RouterStore } from '@ngworker/router-component-store';

@Component({
  // (...)
})
export class HeroDetailComponent {
  #routerStore = inject(RouterStore);

  heroId$: Observable<string | undefined> =
    this.#routerStore.selectRouteParam('id');
}
```

### Local router store

A component-level router store. Can be injected in any directive, component,
pipe, or component-level service. Explicitly provided in a component sub-tree
using `Component.providers` or `Component.viewProviders`.

Usage in component:

```typescript
// hero-detail.component.ts
// (...)
import {
  provideLocalRouterStore,
  RouterStore,
} from '@ngworker/router-component-store';

@Component({
  // (...)
  providers: [provideLocalRouterStore()],
})
export class HeroDetailComponent {
  #routerStore = inject(RouterStore);

  heroId$: Observable<string | undefined> =
    this.#routerStore.selectRouteParam('id');
}
```
