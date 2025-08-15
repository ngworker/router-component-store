# Router Component Store changelog

## 15.0.0 (2025-08-14)

First stable release. No functional or API changes from 15.0.0-rc.2.

### Features

Provide local or global router store using `provideLocalRouterStore` or `provideGlobalRouterStore`, respectively

- A local router store matches the `ActivatedRoute` service's observable properties and follow the lifecycle of the component that provides it
- The global router store matches the `@ngrx/router-store` selectors and is never destroyed

Both local and global stores implement a common `RouterStore` API:

- `currentRoute$`
- `fragment$`
- `queryParams$`
- `routeData$`
- `routeParams$`
- `title$`
- `url$`
- `selectQueryParam(param: string)`
- `selectRouteData(key: string)`
- `selectRouteParam(param: string)`
- `selectRouterEvents(...acceptedRouterEvents: RouterEvent[])`

`RouterStore` is also the injection symbol usable through constructor injection, `inject`, `TestBed.inject`, and `Injector.get`. When `RouterStore` is injected, it resolves to the closest provided local or global router store according to element and environment injectors.

`RouterStore` uses a serializable router state called `MinimalActivatedRouteSnapshot`. It uses additional strict, immutable types like `StrictQueryParams`, `StrictRouteData´, and `StrictRouteParams`.

## 15.0.0-rc.2 (2025-02-12)

### Features

- Use `StrictQueryParams` for query parameters instead of `StrictRouteParams` ([#331](https://github.com/ngworker/router-component-store/pull/331))

Array query parameters like `?size=m&size=l&size=xl` are now correctly resolved to `readonly string[]` instead of `string`.

**BREAKING CHANGES**

**`RouterStore#queryParams$` and `MinimalActivatedRouteSnapshot#queryParams` use `StrictQueryParams`**

`RouterStore#queryParams$` and `MinimalActivatedRouteSnapshot#queryParams` use `StrictQueryParams` instead of `StrictRouteParams`. Members are of type `string | readonly string[] | undefined` instead of `string | undefined`.

The TypeScript compiler will fail to compile code that does not handle the string array type.

BEFORE:

```typescript
// shirts.component.ts
// (...)
import { RouterStore } from '@ngworker/router-component-store';

@Component({
  // (...)
})
export class ShirtsComponent {
  #routerStore = inject(RouterStore);

  size$: Observable<string> = this.#routerStore.queryParams$.pipe(
    map((params) => params['size'])
  );
}
```

AFTER:

```typescript
// shirts.component.ts
// (...)
import { RouterStore } from '@ngworker/router-component-store';

@Component({
  // (...)
})
export class ShirtsComponent {
  #routerStore = inject(RouterStore);

  size$: Observable<readonly string[]> = this.#routerStore.queryParams$.pipe(
    map((params) => params['size']),
    map((size) => size ?? []),
    map((size) => (Array.isArray(size) ? size : [size]))
  );
}
```

**`RouterStore#selectQueryParam` use `StrictQueryParams`**

`RouterStore#selectQueryParam` use `StrictQueryParams` instead of `StrictRouteParams`. The returned value is of type `string | readonly string[] | undefined` instead of `string | undefined`.

The TypeScript compiler will fail to compile code that does not handle the string array type.

BEFORE:

```typescript
// shirts.component.ts
// (...)
import { RouterStore } from '@ngworker/router-component-store';

@Component({
  // (...)
})
export class ShirtsComponent {
  #routerStore = inject(RouterStore);

  size$: Observable<string> = this.#routerStore.selectQueryParam('size');
}
```

AFTER:

```typescript
// shirts.component.ts
// (...)
import { RouterStore } from '@ngworker/router-component-store';

@Component({
  // (...)
})
export class ShirtsComponent {
  #routerStore = inject(RouterStore);

  size$: Observable<readonly string[]> = this.#routerStore
    .selectQueryParam('size')
    .pipe(
      map((size) => size ?? []),
      map((size) => (Array.isArray(size) ? size : [size]))
    );
}
```

## 15.0.0-rc.1 (2024-09-17)

### Refactors

- Replace `StrictRouteParams` with simple type ([#325](https://github.com/ngworker/router-component-store/pull/325))
- Replace `StrictRouteData` with simple type ([#326](https://github.com/ngworker/router-component-store/pull/326))

## 15.0.0-rc.0 (2024-09-03)

### Features

- `LocalRouterStore` matches `ActivatedRoute` more closely ([#309](https://github.com/ngworker/router-component-store/pull/309))
  - Use `ActivatedRoute` to serialize the router state for the local router store implementation (`LocalRouterStore`)
  - `LocalRouterStore.currentRoute$` matches `ActivatedRoute.snapshot`
- Remove optional type parameter from `RouterStore#selectRouteData` ([#316](https://github.com/ngworker/router-component-store/pull/316))
- Replace `MinimalRouteData` with `StrictRouteData` ([#319](https://github.com/ngworker/router-component-store/pull/319))
- Change `RouterStore#routeData$` and `MinimalActivatedRouteSnapshot#data` types from `Data` to `StrictRouteData` ([#319](https://github.com/ngworker/router-component-store/pull/319))
- Use strict and immutable route parameters ([#319](https://github.com/ngworker/router-component-store/pull/319), [#321](https://github.com/ngworker/router-component-store/pull/321))
- Use strict and immutable query parameters ([#320](https://github.com/ngworker/router-component-store/pull/320))

**BREAKING CHANGES**

**`LocalRouterStore.currentRoute$` matches `ActivatedRoute.snapshot`**

This change in implementation will make the local router store more closely match `ActivatedRoute` while the global router store matches NgRx Router Store selectors. Through complex route configurations, the router store implementations are exercised to identify edge case differences between them and any breaking changes introduced to the local router store.

BEFORE:

```typescript
// URL: /parent/child/grandchild

@Component({
  /* (...) */
  providers: [provideLocalRouterStore()],
})
export class ChildComponent implements OnInit {
  #route = inject(ActivatedRoute);
  #routerStore = inject(RouterStore);

  ngOnInit() {
    const currentRouteSnapshot = this.#route.snapshot;
    console.log(currentRouteSnapshot.routeConfig.path);
    // -> "child"
    console.log(currentRouteSnapshot.url[0].path);
    // -> "child"

    firstValueFrom(this.#routerStore.currentRoute$).then((currentRoute) => {
      console.log(currentRoute.routeConfig.path);
      // -> "grandchild"
      console.log(currentRoute.url[0].path);
      // -> "grandchild"
    });
  }
}
```

AFTER:

```typescript
// URL: /parent/child/grandchild

@Component({
  /* (...) */
  providers: [provideLocalRouterStore()],
})
export class ChildComponent implements OnInit {
  #route = inject(ActivatedRoute);
  #routerStore = inject(RouterStore);

  ngOnInit() {
    const currentRouteSnapshot = this.#route.snapshot;
    console.log(currentRouteSnapshot.routeConfig.path);
    // -> "child"
    console.log(currentRouteSnapshot.url[0].path);
    // -> "child"

    firstValueFrom(this.#routerStore.currentRoute$).then((currentRoute) => {
      console.log(currentRoute.routeConfig.path);
      // -> "child"
      console.log(currentRoute.url[0].path);
      // -> "child"
    });
  }
}
```

**The type parameter is removed from `RouterStore#selectRouteData` for stricter typing and to enforce coercion**

BEFORE:

```typescript
// heroes.component.ts
// (...)
import { RouterStore } from '@ngworker/router-component-store';
@Component({
  // (...)
})
export class HeroesComponent {
  #routerStore = inject(RouterStore);
  limit$ = this.#routerStore.selectRouteData<number>('limit');
}
```

AFTER:

```typescript
// heroes.component.ts
// (...)
import { RouterStore } from '@ngworker/router-component-store';
@Component({
  // (...)
})
export class HeroesComponent {
  #routerStore = inject(RouterStore);
  limit$ = this.#routerStore.selectRouteData('limit').pipe(x => Number(x));
```

**The `RouterStore#routeData$` selector emits `StrictRouteData` instead of `Data`**

BEFORE:

```typescript
// heroes.component.ts
// (...)
import { RouterStore } from '@ngworker/router-component-store';
@Component({
  // (...)
})
export class HeroesComponent {
  #routerStore = inject(RouterStore);
  limit$: Observable<number> = this.#routerStore.routeData$.pipe(
    map((routeData) => routeData['limit'])
  );
}
```

AFTER:

```typescript
// heroes.component.ts
// (...)
import { RouterStore } from '@ngworker/router-component-store';
@Component({
  // (...)
})
export class HeroesComponent {
  #routerStore = inject(RouterStore);
  limit$: Observable<number> = this.#routerStore.routeData$.pipe(
    map(routeData => routeData['limit']),
    map(x => Number(x))
  );
```

**`RouterStore#routeParams$` and `MinimalActivatedRouteSnapshot#params` use `StrictRouteData` instead of `Params`. Members are read-only and of type `string | undefined` instead of `any`**

TypeScript will fail to compile application code that has assumed a route type parameter type other than `string | undefined`.

BEFORE:

```typescript
// heroes.component.ts
// (...)
import { RouterStore } from '@ngworker/router-component-store';

@Component({
  // (...)
})
export class DashboardComponent {
  #routerStore = inject(RouterStore);

  limit$: Observable<number> = this.#routerStore.routeParams$.pipe(
    map((params) => params['limit'])
  );
}
```

AFTER:

```typescript
// heroes.component.ts
// (...)
import { RouterStore } from '@ngworker/router-component-store';

@Component({
  // (...)
})
export class DashboardComponent {
  #routerStore = inject(RouterStore);

  limit$: Observable<number> = this.#routerStore.routeParams$.pipe(
    map((params) => Number(params['limit'] ?? 10))
  );
}
```

**`StrictRouteData` members are now read-only**

TypeScript will fail to compile application code that mutates route data data structures.

BEFORE:

```typescript
// heroes.component.ts
// (...)
import { RouterStore } from '@ngworker/router-component-store';

@Component({
  // (...)
})
export class DashboardComponent {
  #routerStore = inject(RouterStore);

  limit$: Observable<number> = this.#routerStore.routeData$.pipe(
    map((data) => {
      data['limit'] = Number(data['limit']);

      return data;
    }),
    map((data) => data['limit'])
  );
}
```

AFTER:

```typescript
// heroes.component.ts
// (...)
import { RouterStore } from '@ngworker/router-component-store';

@Component({
  // (...)
})
export class DashboardComponent {
  #routerStore = inject(RouterStore);

  limit$: Observable<number> = this.#routerStore.routeData$.pipe(
    map((data) => Number(data['limit']))
  );
}
```

**`RouterStore#queryParams$` and `MinimalActivatedRouteSnapshot#queryParams` use `StrictRouteParams` instead of `Params`. Members are read-only and of type `string | undefined` instead of `any`**

TypeScript will fail to compile application code that has assumed a query parameter type other than `string | undefined`.

BEFORE:

```typescript
// heroes.component.ts
// (...)
import { RouterStore } from '@ngworker/router-component-store';

@Component({
  // (...)
})
export class DashboardComponent {
  #routerStore = inject(RouterStore);

  limit$: Observable<number> = this.#routerStore.queryParams$.pipe(
    map((params) => params['limit'])
  );
}
```

AFTER:

```typescript
// heroes.component.ts
// (...)
import { RouterStore } from '@ngworker/router-component-store';

@Component({
  // (...)
})
export class DashboardComponent {
  #routerStore = inject(RouterStore);

  limit$: Observable<number> = this.#routerStore.queryParams$.pipe(
    map((params) => Number(params['limit'] ?? 10))
  );
}
```

**Compatibility**

To avoid compatibility issues, we now require the same RxJS peer dependency as NgRx ComponentStore, namely at least RxJS version 7.5 ([#311](https://github.com/ngworker/router-component-store/pull/311)).

- Require Angular 15.0
- Require `@ngrx/component-store` 15.0
- Require RxJS 7.5
- Require TypeScript 4.8

## 0.3.2 (2023-01-03)

### Performance optimizations

- Ignore non-essential router events when serializing the router state. Only `NavigationStart`, `RoutesRecognized`, `NavigationEnd`, `NavigationCancel`, and `NavigationError` events are essential.

## 0.3.1 (2023-01-03)

### Features

- Add factory for selecting router events of specific types: `RouterStore#selectRouterEvents`

## 0.3.0 (2022-12-19)

### Features

- Add factory for selecting specific route data: `RouterStore#selectRouteData`
- Add route title to `MinimalActivatedRouteSnapshot#title`
- Add route title selector: `RouterStore#title$`
- Add type `MinimalRouteData` for serializable route data

### **BREAKING CHANGES**

#### Remove symbol keys from Route data

To keep route data serializable, we have removed support for the Angular Router's `Data` type's symbol index in `MinimalActivatedRouteSnapshot#data`. In particular, this is done to remove the `Symbol(RouteTitle)` entry added by the Angular Router for internal use. Use our `MinimalRouteData` type instead of `Data` from `@angular/router` for route data.

#### Provider factories return provider arrays

The `provideGlobalRouterStore` and `provideLocalRouterStore` functions now return an array of providers (`Provider[]`) instead of a single provider (`Provider`). No changes required in your `providers` metadata, for example the following usage remains the same.

```typescript
@Component({
  // (...)
  providers: [provideLocalRouterStore()],
})
// (...)
```

#### Compatibility

To support the stricter route `title` type introduced by the Angular Router, we now require at least the following peer dependencies.

- Require Angular 15.0
- Require `@ngrx/component-store` 15.0
- Require RxJS 7.4
- Require TypeScript 4.8

We have dropped TypeScript constructor parameter properties for ECMAScript compatibility, namely the `useDefineForClassFields` TypeScript compiler option is `true` (the default when targeting ES2022 or higher).

We have dropped TypeScript constructor parameter decorators for ECMAScript decorators compatibility.

## 0.2.0 (2022-10-24)

### Features

- Remove type parameter from `selectQueryParam`
- Specify observable type returned from `selectQueryParam`
- Remove type parameter from `selectRouteParam`
- Specify observable type returned from `selectRouteParam`

### Bug fixes

- Fixes [#272](https://github.com/ngworker/router-component-store/issues/272) by building the package using Angular 14. Standalone components and applications are now fully supported, including in component tests.

### **BREAKING CHANGES**

#### Compatibility

To fully support standalone Angular applications and components, we now require at least the following peer dependencies.

- Require Angular 14.0
- Require `@ngrx/component-store` 14.0
- Require RxJS 7.4
- Require TypeScript 4.6

#### Stricter signature for selectQueryParam

Signature before:

```typescript
selectQueryParam<TValue>(param: string): Observable<TValue>;
```

Signature after:

```typescript
selectQueryParam(param: string): Observable<string | undefined>;
```

##### Migration

Loose types now yield compilation errors. Remove the type parameter to use the
actual emitted type of `string | undefined` and optionally use operators to
change or narrow the type.

Before:

```typescript
// Actual emitted values are of type `string | undefined` regardless of what we specify
const filter$ = routerStore.selectQueryParam<string | null>('filter');
```

After:

```typescript
// Emitted values are implicitly of type `string | undefined` and are only changeable through operators
const filter$ = routerStore
  .selectQueryParam('filter')
  .pipe(map((filter) => filter ?? null));
```

#### Stricter signature for selectRouteParam

Signature before:

```typescript
selectRouteParam<TValue>(param: string): Observable<TValue>;
```

Signature after:

```typescript
selectRouteParam(param: string): Observable<string | undefined>;
```

##### Migration

Loose types now yield compilation errors. Remove the type parameter to use the
actual emitted type of `string | undefined` and optionally use operators to
change or narrow the type.

Before:

```typescript
// Actual emitted values are of type `string | undefined` regardless of what we specify
const id$ = routerStore.selectRouteParam<number>('id');
```

After:

```typescript
// Emitted values are implicitly of type `string | undefined` and are only changeable through operators
const id$ = routerStore.selectRouteParam('id').pipe(
  map(id => id === undefined ? undefined : Number(id),
);
```

## 0.1.1 (2022-10-21)

### Features

- Add `RouterStore`
- Remove `LocalRouterStore`
- Add `provideLocalRouterStore`
- Remove `GlobalRouterStore`
- Add `provideGlobalRouterStore`

### Bug fixes

- Fix [#272](https://github.com/ngworker/router-component-store/issues/272): Class constructor ComponentStore cannot be invoked without 'new'

### **BREAKING CHANGES**

#### Require RxJS 7.2

We now require at least RxJS version 7.2 to import operators from the primary entry point of the `rxjs` package.

#### LocalRouterStore is removed

`LocalRouterStore` is replaced by `RouterStore` and `provideLocalRouterStore`.

##### Migration

Use `provideLocalRouterStore()` as component-level provider and inject `RouterStore` instead of `LocalRouterStore`.

Before:

```typescript
// hero-detail.component.ts
// (...)
import { LocalRouterStore } from '@ngworker/router-component-store';

@Component({
  // (...)
  providers: [LocalRouterStore],
})
export class HeroDetailComponent {
  heroId$: Observable<string> = this.routerStore.selectQueryParam('id');

  constructor(private routerStore: LocalRouterStore) {}
}
```

After:

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
  heroId$: Observable<string> = this.routerStore.selectQueryParam('id');

  constructor(private routerStore: RouterStore) {}
}
```

#### GlobalRouterStore is removed

`GlobalRouterStore` is replaced by `RouterStore` and `provideGlobalRouterStore`.

##### Migration

Add `provideGlobalRouterStore()` to your root environment injector and inject `RouterStore` instead of `GlobalRouterStore`.

Before:

```typescript
// hero.service.ts
// (...)
import { GlobalRouterStore } from '@ngworker/router-component-store';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  activeHeroId$: Observable<string> = this.routerStore.selectQueryParam('id');

  constructor(private routerStore: GlobalRouterStore) {}
}
```

After:

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

```typescript
// hero.service.ts
// (...)
import { RouterStore } from '@ngworker/router-component-store';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  activeHeroId$: Observable<string> = this.routerStore.selectQueryParam('id');

  constructor(private routerStore: RouterStore) {}
}
```

## 0.0.2 (2021-11-20)

### Refactorings

- Encapsulate members inherited from `ComponentStore`

## 0.0.1 (2021-11-20)

### Features

- add `GlobalRouterStore`
- add `LocalRouterStore`
