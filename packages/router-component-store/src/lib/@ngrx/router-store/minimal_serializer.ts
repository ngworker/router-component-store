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
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Data,
  RouterStateSnapshot,
} from '@angular/router';
import { InternalStrictRouteData } from '../../internal-strict-route-data';
import { InternalStrictRouteParams } from '../../internal-strict-route-params';
import { MinimalActivatedRouteSnapshot } from './minimal-activated-route-state-snapshot';
import { MinimalRouterStateSnapshot } from './minimal-router-state-snapshot';

@Injectable({
  providedIn: 'root',
})
export class MinimalRouterStateSerializer {
  serialize(routerState: RouterStateSnapshot): MinimalRouterStateSnapshot {
    return {
      root: this.#serializeRouteSnapshot(routerState.root),
      url: routerState.url,
    };
  }

  #serializeRouteData(routeData: Data): InternalStrictRouteData {
    return Object.fromEntries(Object.entries(routeData));
  }

  #serializeRouteSnapshot(
    routeSnapshot: ActivatedRouteSnapshot
  ): MinimalActivatedRouteSnapshot {
    const children = routeSnapshot.children.map((childRouteSnapshot) =>
      this.#serializeRouteSnapshot(childRouteSnapshot)
    );
    return {
      params: routeSnapshot.params as InternalStrictRouteParams,
      data: this.#serializeRouteData(
        routeSnapshot.data
      ) as InternalStrictRouteData,
      url: routeSnapshot.url,
      outlet: routeSnapshot.outlet,
      title: routeSnapshot.title,
      routeConfig: routeSnapshot.routeConfig
        ? {
            path: routeSnapshot.routeConfig.path,
            pathMatch: routeSnapshot.routeConfig.pathMatch,
            redirectTo: routeSnapshot.routeConfig.redirectTo,
            outlet: routeSnapshot.routeConfig.outlet,
            title:
              typeof routeSnapshot.routeConfig.title === 'string'
                ? routeSnapshot.routeConfig.title
                : undefined,
          }
        : null,
      queryParams: routeSnapshot.queryParams as InternalStrictRouteParams,
      fragment: routeSnapshot.fragment,
      firstChild: children[0],
      children,
    };
  }
}
