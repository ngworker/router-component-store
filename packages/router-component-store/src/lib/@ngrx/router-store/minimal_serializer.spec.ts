/**
 * @license
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 Brandon Roberts, Mike Ryan, Victor Savkin, Rob Wormald
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { RouterStateSnapshot } from '@angular/router';

import { MinimalRouterStateSerializer } from './minimal_serializer';

describe('minimal serializer', () => {
  it('should serialize only the minimal properties', () => {
    const serializer = new MinimalRouterStateSerializer();
    const snapshot = createRouteSnapshot();
    const routerState = {
      url: 'url',
      root: snapshot,
    } as RouterStateSnapshot;

    const actual = serializer.serialize(routerState);
    const expected = {
      url: 'url',
      root: createExpectedSnapshot(),
    };
    expect(actual).toEqual(expected);
  });

  it('should serialize with an empty routeConfig', () => {
    const serializer = new MinimalRouterStateSerializer();
    const snapshot = { ...createRouteSnapshot(), routeConfig: null };
    const routerState = {
      url: 'url',
      root: snapshot,
    } as RouterStateSnapshot;

    const actual = serializer.serialize(routerState);
    const expected = {
      url: 'url',
      root: {
        ...createExpectedSnapshot(),
        routeConfig: null,
      },
    };
    expect(actual).toEqual(expected);
  });

  it('should serialize children', () => {
    const serializer = new MinimalRouterStateSerializer();
    const snapshot = {
      ...createRouteSnapshot(),
      children: [createRouteSnapshot('child')],
    };
    const routerState = {
      url: 'url',
      root: snapshot,
    } as RouterStateSnapshot;

    const actual = serializer.serialize(routerState);

    const expected = {
      url: 'url',
      root: {
        ...createExpectedSnapshot(),
        firstChild: createExpectedSnapshot('child'),
        children: [createExpectedSnapshot('child')],
      },
    };

    expect(actual).toEqual(expected);
  });

  function createExpectedSnapshot(prefix = 'root') {
    const snapshot = {
      ...createRouteSnapshot(prefix),
      routeConfig: {
        // config doesn't have a component because it isn't serializable
        path: `${prefix}-route.routeConfig.path`,
        pathMatch: `${prefix}-route.routeConfig.pathMatch`,
        redirectTo: `${prefix}-route.routeConfig.redirectTo`,
        outlet: `${prefix}-route.routeConfig.outlet`,
        title: `${prefix}-route.routeConfig.title`,
      },
      firstChild: undefined,
    };

    // properties that aren't serializable
    delete snapshot.paramMap;
    delete snapshot.queryParamMap;
    delete snapshot.component;

    // properties that do not exist on the minimal serializer
    delete snapshot.root;
    delete snapshot.parent;
    delete snapshot.pathFromRoot;

    return snapshot;
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createRouteSnapshot(prefix = 'root'): any {
  return {
    params: `${prefix}-route.params`,
    paramMap: `${prefix}-route.paramMap`,
    data: {
      [`${prefix}-data`]: `${prefix}-route.data.${prefix}-data`,
    },
    url: `${prefix}-route.url`,
    outlet: `${prefix}-route.outlet`,
    routeConfig: {
      component: `${prefix}-route.routeConfig.component`,
      path: `${prefix}-route.routeConfig.path`,
      pathMatch: `${prefix}-route.routeConfig.pathMatch`,
      redirectTo: `${prefix}-route.routeConfig.redirectTo`,
      outlet: `${prefix}-route.routeConfig.outlet`,
      title: `${prefix}-route.routeConfig.title`,
    },
    queryParams: `${prefix}-route.queryParams`,
    queryParamMap: `${prefix}-route.queryParamMap`,
    fragment: `${prefix}-route.fragment`,
    root: `${prefix}-route.root`,
    parent: `${prefix}-route.parent`,
    pathFromRoot: `${prefix}-route.params`,
    firstChild: null,
    children: [],
  };
}
