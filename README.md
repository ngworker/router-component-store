# Router Component Store

[`@ngworker/router-component-store`](https://www.npmjs.com/package/@ngworker/router-component-store)

<img src="https://github.com/ngworker/router-component-store/blob/main/logo.png" alt="Router Component Store" height="384px">

A strictly typed lightweight alternative to NgRx Router Store (`@ngrx/router-store`) and `ActivatedRoute`.

## Compatibility

Required peer dependencies:

- Angular >=15.0
- NgRx Component Store >=15.0
- RxJS >=7.5
- TypeScript >=4.8

Published with partial Ivy compilation.

Find additional documentation in the [github.com/ngworker/router-component-store/docs](https://github.com/ngworker/router-component-store/tree/main/docs) directory.

## Guiding principles

Router Component Store is meant as a lightweight alternative to NgRx Router Store that additionaly can be used as a replacement for `ActivatedRoute` at any route level.

The following principles guide the development of Router Component Store.

- The global router store closely matches NgRx Router Store selectors
- Local router stores closely match `ActivatedRoute` observable properties
- Router state is serializable
- The API is strictly and strongly typed

## API

### RouterStore

A `RouterStore` service has the following public properties.

| API                                                                                   | Description                                               |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `currentRoute$: Observable<MinimalActivatedRouteSnapshot>`                            | Select the current route.                                 |
| `fragment$: Observable<string \| null>`                                               | Select the current route fragment.                        |
| `queryParams$: Observable<StrictRouteParams>`                                         | Select the current route query parameters.                |
| `routeData$: Observable<StrictRouteData>`                                             | Select the current route data.                            |
| `routeParams$: Observable<StrictRouteParams>`                                         | Select the current route parameters.                      |
| `title$: Observable<string \| undefined>`                                             | Select the resolved route title.                          |
| `url$: Observable<string>`                                                            | Select the current URL.                                   |
| `selectQueryParam(param: string): Observable<string \| undefined>`                    | Select the specified query parameter.                     |
| `selectRouteData(key: string): Observable<unknown>`                                   | Select the specified route data.                          |
| `selectRouteParam(param: string): Observable<string \| undefined>`                    | Select the specified route parameter.                     |
| `selectRouterEvents(...acceptedRouterEvents: RouterEvent[]): Observable<RouterEvent>` | Select router events of the specified router event types. |

A `RouterStore` service is provided by using either `provideGlobalRouterStore`or `provideLocalRouterStore`.

The _global_ `RouterStore` service is provided in a root environment injector and is never destroyed but can be injected in any injection context.

It emits values similar to `@ngrx/router-store` selectors. A comparison is in the documentation.

A _local_ `RouterStore` requires a component-level provider, follows the lifecycle of that component, and can be injected in declarables as well as other component-level services.

It emits values similar to `ActivatedRoute`. A comparison is in the documentation.

#### Global router store

An application-wide router store that can be injected in any injection context. Use `provideGlobalRouterStore` to provide it in a root environment injector.

Use a global router store instead of NgRx Router Store.

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

#### Local router store

A component-level router store. Can be injected in any directive, component,
pipe, or component-level service. Explicitly provided in a component sub-tree
using `Component.providers` or `Component.viewProviders`.

Use a local router store instead of `ActivatedRoute`.

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

### Serializable router state

Several of the Angular Router's types are recursive which means that they aren't serializable. The router stores exclusively use serializable types to support advanced state synchronization strategies.

#### MinimalActivatedRouteSnapshot

The `MinimalActivatedRouteSnapshot` interface is used for the observable `RouterStore#currentRoute$` property. This interface is a serializable subset of the Angular Router's `ActivatedRouteSnapshot` class and has the following public properties.

| API                                                 | Description                                      |
| --------------------------------------------------- | ------------------------------------------------ |
| `children: MinimalActivatedRouteSnapshot[]`         | The children of this route in the route tree.    |
| `data: StrictRouteData`                             | The static and resolved data of this route.      |
| `firstChild: MinimalActivatedRouteSnapshot \| null` | The first child of this route in the route tree. |
| `fragment: string \| null`                          | The URL fragment shared by all routes.           |
| `outlet: string`                                    | The outlet name of the route.                    |
| `params: StrictRouteParams`                         | The matrix parameters scoped to this route.      |
| `queryParams: StrictRouteParams`                    | The query parameters shared by all routes.       |
| `routeConfig: Route \| null`                        | The configuration used to match this route.      |
| `title: string \| undefined`                        | The resolved route title.                        |
| `url: UrlSegment[]`                                 | The URL segments matched by this route.          |

#### StrictRouteData

The `StrictRouteData` interface is used for the `MinimalActivatedRouteSnapshot#data` and `RouterStore#routeData$` properties. This interface is a serializable subset of the Angular Router's `Data` type. In particular, the `symbol` index in the Angular Router's `Data` type is removed. Additionally, the `any` member type is replaced with `unknown` for stricter typing.

`StrictRouteData` has the following signature.

```typescript
export type StrictRouteData = {
  [key: string]: unknown;
};
```

#### StrictRouteParams

The `StrictRouteParams` type is used for route parameters in the `MinimalActivatedRouteSnapshot#params` and `RouterStore#routeParams$` properties and for query parameters in the `MinimalActivatedRouteSnapshot#queryParams` and `RouterStore#queryParams$` properties. It is a strictly typed version of the Angular Router's `Params` type where members are read-only and the `any` member type is replaced with `string | undefined`.

`StrictRouteParams` has the following signature.

```typescript
export type StrictRouteParams = {
  readonly [key: string]: string | undefined;
};
```
