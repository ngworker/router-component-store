# Router Component Store changelog

## 0.3.0 (2022-12-19)

### Features

- Add factory for selecting specific route data: `RouterStore#selectRouteData`
- Add route title to `MinimalActivatedRouteSnapshot#title`
- Add route title selector: `RouterStore#title$`

### **BREAKING CHANGES**

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
