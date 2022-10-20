# Router Component Store changelog

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
