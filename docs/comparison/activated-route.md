# ActivatedRoute comparison

A local router store provider uses `ActivatedRoute`. Its selectors closely match the values emitted by `ActivatedRoute` observable properties.

## Selectors

The following table lists `ActivatedRoute` observable properties and their Router Component Store counterparts when using `provideLocalRouterStore`.

| `ActivatedRoute`    | Router Component Store                                    |
| ------------------- | --------------------------------------------------------- |
| `snapshot`          | `RouterStore#currentRoute$`                               |
| `fragment`          | `RouterStore#fragment$`                                   |
| `queryParamMap#get` | `RouterStore#selectQueryParam`                            |
| `queryParams`       | `RouterStore#queryParams$`                                |
| `data`              | `RouterStore#routeData$`                                  |
| `data#[key]`        | `RouterStore#selectRouteData`                             |
| `paramMap#get`      | `RouterStore#selectRouteParam`                            |
| `params`            | `RouterStore#routeParams$`                                |
| `title`             | `RouterStore#title$`                                      |
| `url`               | `RouterStore#currentRoute$.pipe(map(route => route.url))` |

`RouterStore#url$` outputs the full application URL string, including the fragment and query parameters.

Additionally, Router Component Store provides the `RouterStore#selectRouterEvents` selector for observing Router events like `NavigationEnd`.
