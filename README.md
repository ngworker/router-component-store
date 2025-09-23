# ngworkers Router Store

<img src="logo.png" alt="Router Component Store" height="384px">

A monorepo containing Angular router state management packages that provide strictly typed, lightweight alternatives to NgRx Router Store (`@ngrx/router-store`) and `ActivatedRoute`.

## Packages

This repository contains two main packages:

### [`@ngworker/router-component-store`](packages/router-component-store/README.md)

A Component Store-based solution using observables:

- **Package**: [`@ngworker/router-component-store`](https://www.npmjs.com/package/@ngworker/router-component-store)
- **Technology**: NgRx Component Store (`@ngrx/component-store`) with RxJS observables
- **Use Case**: When you prefer observable-based reactivity patterns

```typescript
// Observable-based API
export class HeroService {
  #routerStore = inject(RouterStore);

  url$ = this.#routerStore.url$; // Observable<string>
  searchTerm$ = this.#routerStore.selectQueryParam('q'); // Observable<string | undefined>
}
```

### [`@ngworker/router-signal-store`](packages/router-signal-store/README.md)

A Signal Store-based solution using Angular Signals:

- **Package**: [`@ngworker/router-signal-store`](https://www.npmjs.com/package/@ngworker/router-signal-store)
- **Technology**: NgRx Signals (`@ngrx/signals`) with Angular Signals
- **Use Case**: When you prefer signal-based reactivity patterns

```typescript
// Signal-based API
export class HeroService {
  #routerSignalStore = inject(RouterSignalStore);

  url = this.#routerSignalStore.url; // Signal<string>
  searchTerm = this.#routerSignalStore.selectQueryParam('q'); // Signal<string | undefined>
}
```

## Common features

Both packages provide:

✅ **Strictly Typed**: Full TypeScript support with strict typing  
✅ **Lightweight**: Minimal bundle size impact  
✅ **Drop-in Replacement**: For NgRx Router Store and `ActivatedRoute`  
✅ **Global & Local Stores**: Application-wide and component-level usage  
✅ **Immutable State**: Router state is immutable and serializable  
✅ **Memory Safe**: Proper subscription management and cleanup

## Compatibility

Both packages follow Angular's recommended release pattern for Angular libraries. One major package version for every major Angular release.

Features released in minor versions of Angular and NgRx packages are not used until the following major version package release to ensure compatibility across minor versions.

The packages require the same peer dependencies as their corresponding Angular and NgRx packages.

## Quick start

### Observable-based (Router Component Store)

```bash
npm install @ngworker/router-component-store
```

```typescript
import { provideGlobalRouterStore } from '@ngworker/router-component-store';

bootstrapApplication(AppComponent, {
  providers: [provideGlobalRouterStore()],
});
```

### Signal-based (Router Signal Store)

```bash
npm install @ngworker/router-signal-store
```

```typescript
import { provideGlobalRouterSignalStore } from '@ngworker/router-signal-store';

bootstrapApplication(AppComponent, {
  providers: [provideGlobalRouterSignalStore()],
});
```

## API comparison

| Feature          | Router Component Store                     | Router Signal Store                        |
| ---------------- | ------------------------------------------ | ------------------------------------------ |
| Current Route    | `currentRoute$: Observable<...>`           | `currentRoute: Signal<...>`                |
| Query Parameters | `queryParams$: Observable<...>`            | `queryParams: Signal<...>`                 |
| Route Parameters | `routeParams$: Observable<...>`            | `routeParams: Signal<...>`                 |
| Route Data       | `routeData$: Observable<...>`              | `routeData: Signal<...>`                   |
| URL              | `url$: Observable<string>`                 | `url: Signal<string>`                      |
| Fragment         | `fragment$: Observable<...>`               | `fragment: Signal<...>`                    |
| Title            | `title$: Observable<...>`                  | `title: Signal<...>`                       |
| Router events    | `selectRouterEvents(...): Observable<...>` | _Not included to avoid an RxJS dependency_ |

## Usage patterns

### Global usage (application-wide)

Both packages support global router stores for application-wide router state access:

```typescript
// Component Store
@Injectable({ providedIn: 'root' })
export class NavigationService {
  #routerStore = inject(RouterStore);
  currentPath$ = this.#routerStore.url$;
}

// Signal Store
@Injectable({ providedIn: 'root' })
export class NavigationService {
  #routerSignalStore = inject(RouterSignalStore);
  currentPath = this.#routerSignalStore.url;
}
```

### Local usage (component-level)

Both packages support local router stores for component-specific router state:

```typescript
// Component Store
@Component({
  providers: [provideLocalRouterStore()],
})
export class ProductComponent {
  #routerStore = inject(RouterStore);
  productId$ = this.#routerStore.selectRouteParam('id');
}

// Signal Store
@Component({
  providers: [provideLocalRouterSignalStore()],
})
export class ProductComponent {
  #routerStore = inject(RouterSignalStore);
  productId = this.#routerStore.selectRouteParam('id');
}
```

## Development

This repository uses:

- **[Nx](https://nx.dev)** for monorepo, task, and CI management
- **Angular**, **RxJS**, and **NgRx**
- **TypeScript**
- **Jest** for testing
- **Prettier** and **ESLint** for code quality

### Commands

```bash
# Install dependencies
yarn install

# Run tests
yarn test

# Run linting
yarn lint

# Build packages
yarn build

# Perform dead code analysis
yarn knip

# Run all CI checks
yarn ci

# Check formatting
yarn format:check

# Format code
yarn format
```

## Documentation

- [Router Component Store package](packages/router-component-store/README.md)
- [Router Signal Store package](packages/router-signal-store/README.md)
- [Additional documentation](docs/)

## Contributing

Contributions are welcome! Submit pull requests to the main branch.

## License

MIT © [ngworkers](https://github.com/ngworker)
