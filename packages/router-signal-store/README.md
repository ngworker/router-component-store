# Router Signal Store

[`@ngworker/router-signal-store`](https://www.npmjs.com/package/@ngworker/router-signal-store)

<img src="https://github.com/ngworker/router-component-store/blob/main/logo.png" alt="Router Component Store" height="384px">

A strictly typed lightweight alternative to NgRx Router Store (`@ngrx/router-store`) and `ActivatedRoute` using NgRx Signals (`@ngrx/signals`).

## Compatibility

Required peer dependencies:

- Angular 17.x
- NgRx Signals 17.x
- TypeScript >=5.2

Published with partial Ivy compilation.

Find additional documentation in the [github.com/ngworker/router-component-store/docs](https://github.com/ngworker/router-component-store/tree/main/docs) directory.

## Guiding principles

Router Signal Store is meant as a lightweight alternative to NgRx Router Store that additionally can be used as a replacement for `ActivatedRoute` at any route level.

The following principles guide the development of Router Signal Store.

- Global router store signals closely matches NgRx Router Store selectors
- Local router store signals closely match `ActivatedRoute` observable properties
- Router state is immutable and serializable
- The API is strictly and strongly typed

## API

### RouterSignalStore

A `RouterSignalStore` service has the following public properties.

| API                                                                                   | Description                                               |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `currentRoute: Signal<MinimalActivatedRouteSnapshot>`                                 | Select the current route.                                 |
| `fragment: Signal<string \| null>`                                                    | Select the current route fragment.                        |
| `queryParams: Signal<StrictQueryParams>`                                              | Select the current route query parameters.                |
| `routeData: Signal<StrictRouteData>`                                                  | Select the current route data.                            |
| `routeParams: Signal<StrictRouteParams>`                                              | Select the current route parameters.                      |
| `title: Signal<string \| undefined>`                                                  | Select the resolved route title.                          |
| `url: Signal<string>`                                                                 | Select the current URL.                                   |
| `selectQueryParam(param: string): Signal<string \| readonly string[] \| undefined>`   | Select the specified query parameter.                     |
| `selectRouteDataParam(key: string): Signal<unknown>`                                  | Select the specified route data.                          |
| `selectRouteParam(param: string): Signal<string \| undefined>`                        | Select the specified route parameter.                     |
| `selectRouterEvents(...acceptedRouterEvents: RouterEvent[]): Observable<RouterEvent>` | Select router events of the specified router event types. |

A `RouterSignalStore` service is provided by using either `provideGlobalRouterSignalStore`or `provideLocalRouterSignalStore`.

The _global_ `RouterSignalStore` service is provided in a root environment injector and is never destroyed but can be injected in any injection context.

It emits values similar to `@ngrx/router-store` selectors. A comparison is in the documentation.

A _local_ `RouterSignalStore` requires a component-level provider, follows the lifecycle of that component, and can be injected in declarables as well as other component-level services.

It emits values similar to `ActivatedRoute`. A comparison is in the documentation.

#### Global router signal store

An application-wide router signal store that can be injected in any injection context. Use `provideGlobalRouterSignalStore` to provide it in a root environment injector.

Use a global router signal store instead of NgRx Router Store.

Providing in a standalone Angular application:

```typescript
// main.ts
// (...)
import { provideGlobalRouterSignalStore } from '@ngworker/router-signal-store';

bootstrapApplication(AppComponent, {
  providers: [provideGlobalRouterSignalStore()],
}).catch((error) => console.error(error));
```

Providing in a classic Angular application:

```typescript
// app.module.ts
// (...)
import { provideGlobalRouterSignalStore } from '@ngworker/router-signal-store';

@NgModule({
  // (...)
  providers: [provideGlobalRouterSignalStore()],
})
export class AppModule {}
```

Usage in service:

```typescript
// hero.service.ts
// (...)
import { RouterSignalStore } from '@ngworker/router-signal-store';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  #routerSignalStore = inject(RouterSignalStore);

  activeHeroId: Signal<string | undefined> = this.#routerSignalStore.selectRouteParam('id');
}
```

Usage in component:

```typescript
// hero-detail.component.ts
// (...)
import { RouterSignalStore } from '@ngworker/router-signal-store';

@Component({
  // (...)
})
export class HeroDetailComponent {
  #routerSignalStore = inject(RouterSignalStore);

  heroId: Signal<string | undefined> = this.#routerSignalStore.selectRouteParam('id');
}
```

#### Local router signal store

A component-level router signal store. Can be injected in any directive, component,
pipe, or component-level service. Explicitly provided in a component sub-tree
using `Component.providers` or `Component.viewProviders`.

Use a local router signal store instead of `ActivatedRoute`.

Usage in component:

```typescript
// hero-detail.component.ts
// (...)
import { provideLocalRouterSignalStore, RouterSignalStore } from '@ngworker/router-signal-store';

@Component({
  // (...)
  providers: [provideLocalRouterSignalStore()],
})
export class HeroDetailComponent {
  #routerSignalStore = inject(RouterSignalStore);

  heroId: Signal<string | undefined> = this.#routerSignalStore.selectRouteParam('id');
}
```

### Serializable router state

Several of the Angular Router's types are recursive which means that they aren't serializable. The router stores exclusively use serializable types to support advanced state synchronization strategies.

#### MinimalActivatedRouteSnapshot

The `MinimalActivatedRouteSnapshot` interface is used for the observable `RouterSignalStore#currentRoute` property. This interface is a serializable subset of the Angular Router's `ActivatedRouteSnapshot` class and has the following public properties.

| API                                                 | Description                                      |
| --------------------------------------------------- | ------------------------------------------------ |
| `children: MinimalActivatedRouteSnapshot[]`         | The children of this route in the route tree.    |
| `data: StrictRouteData`                             | The static and resolved data of this route.      |
| `firstChild: MinimalActivatedRouteSnapshot \| null` | The first child of this route in the route tree. |
| `fragment: string \| null`                          | The URL fragment shared by all routes.           |
| `outlet: string`                                    | The outlet name of the route.                    |
| `params: StrictRouteParams`                         | The matrix parameters scoped to this route.      |
| `queryParams: StrictQueryParams`                    | The query parameters shared by all routes.       |
| `routeConfig: Route \| null`                        | The configuration used to match this route.      |
| `title: string \| undefined`                        | The resolved route title.                        |
| `url: UrlSegment[]`                                 | The URL segments matched by this route.          |

#### StrictQueryParams

The `StrictQueryParams` type is used for query parameters in the `MinimalActivatedRouteSnapshot#queryParams` and `RouterSignalStore#queryParams` properties. It is a strictly typed version of the Angular Router's `Params` type where members are read-only and the `any` member type is replaced with `string | readonly string[] | undefined`.

`StrictQueryParams` has the following signature.

```typescript
export type StrictQueryParams = {
  readonly [key: string]: string | readonly string[] | undefined;
};
```

#### StrictRouteData

The `StrictRouteData` interface is used for the `MinimalActivatedRouteSnapshot#data` and `RouterSignalStore#routeData` properties. This interface is a serializable subset of the Angular Router's `Data` type. In particular, the `symbol` index in the Angular Router's `Data` type is removed. Additionally, the `any` member type is replaced with `unknown` for stricter typing.

`StrictRouteData` has the following signature.

```typescript
export type StrictRouteData = {
  readonly [key: string]: unknown;
};
```

#### StrictRouteParams

The `StrictRouteParams` type is used for route parameters in the `MinimalActivatedRouteSnapshot#params` and `RouterSignalStore#routeParams` properties. It is a strictly typed version of the Angular Router's `Params` type where members are read-only and the `any` member type is replaced with `string | undefined`.

`StrictRouteParams` has the following signature.

```typescript
export type StrictRouteParams = {
  readonly [key: string]: string | undefined;
};
```
