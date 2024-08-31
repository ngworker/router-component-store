# NgRx Router Store comparison

Router Component Store is inspired the `@ngrx/router-store` package.

## Selectors

The following table lists NgRx Router Store selectors and their Router Component Store counterparts when using `provideGlobalRouterStore`.

| NgRx Router Store      | Router Component Store         |
| ---------------------- | ------------------------------ |
| `selectCurrentRoute`   | `RouterStore#currentRoute$`    |
| `selectFragment`       | `RouterStore#fragment$`        |
| `selectQueryParam`     | `RouterStore#selectQueryParam` |
| `selectQueryParams`    | `RouterStore#queryParams$`     |
| `selectRouteData`      | `RouterStore#routeData$`       |
| `selectRouteDataParam` | `RouterStore#selectRouteData`  |
| `selectRouteParam`     | `RouterStore#selectRouteParam` |
| `selectRouteParams`    | `RouterStore#routeParams$`     |
| `selectTitle`          | `RouterStore#title$`           |
| `selectUrl`            | `RouterStore#url$`             |

Additionally, Router Component Store provides the `RouterStore#selectRouterEvents` selector for observing Router events like `NavigationEnd`.

## Redux Devtools

NgRx Router Store integrates with NgRx Store and NgRx Store Devtools. Router Component Store does not.

## Actions

NgRx Router Store uses NgRx Store actions to synchronize to NgRx Store and NgRx Store Devtools. Router Component Store does not have actions. Instead, it hooks directly into Angular's `Router` and `ActivatedRoute` services. Because of this, Router Component Store does not have a _navigation action timing_ setting.

Router Component Store synchronizes router state at the following router events.

- `NavigationCancel`
- `NavigationEnd`
- `NavigationError`
- `NavigationStart`
- `RoutesRecognized`

## Router state serializer

NgRx Router Store uses `MinimalRouterStateSerializer` by default, offers a `FullRouterStateSerializer`, and supports a custom router state seralizer through a _serializer_ setting. Router Component Store uses a serializer similar to `MinimalRouterStateSerializer` but does not support a full or custom router state serializer.
