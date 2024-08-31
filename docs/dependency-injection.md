# Dependency injection

Router Component Store uses the shared `RouterStore` class as its public API for both the global router store and local router stores.

## Injecting any router store

Inject `RouterStore` without any inject options if the scope of the router store is not important for the use case.

```typescript
// app.component.ts
// (...)
import { RouterStore } from '@ngworker/router-component-store';

@Component({
  // (...)
})
export class AppComponent {
  #routerStore = inject(RouterStore);
}
```

## Injecting the global router store

To ensure injection of the global router store, inject it from an `EnvironmentInjector`.

```typescript
// crisis-center.component.ts
// (...)
import { RouterStore } from '@ngworker/router-component-store';

@Component({
  // (...)
})
export class CrisisCenterComponent {
  #globalRouterStore = inject(EnvironmentInjector).get(RouterStore);
}
```

## Injecting a local router store

To ensure injection of a local router store, use the `host` inject option.

```typescript
// crisis-detail.component.ts
// (...)
import {
  provideLocalRouterStore,
  RouterStore,
} from '@ngworker/router-component-store';

@Component({
  // (...)
  providers: [provideLocalRouterStore()],
})
export class CrisisDetailComponent {
  #localRouterStore = inject(RouterStore, { host: true });
}
```
