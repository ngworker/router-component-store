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
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export interface MinimalActivatedRouteSnapshot {
  readonly routeConfig: ActivatedRouteSnapshot['routeConfig'];
  readonly url: ActivatedRouteSnapshot['url'];
  readonly params: ActivatedRouteSnapshot['params'];
  readonly queryParams: ActivatedRouteSnapshot['queryParams'];
  readonly fragment: ActivatedRouteSnapshot['fragment'];
  readonly data: ActivatedRouteSnapshot['data'];
  readonly outlet: ActivatedRouteSnapshot['outlet'];
  readonly firstChild?: MinimalActivatedRouteSnapshot;
  readonly children: MinimalActivatedRouteSnapshot[];
}

export interface MinimalRouterStateSnapshot {
  readonly root: MinimalActivatedRouteSnapshot;
  readonly url: string;
}

@Injectable({
  providedIn: 'root',
})
export class MinimalRouterStateSerializer {
  serialize(routerState: RouterStateSnapshot): MinimalRouterStateSnapshot {
    return {
      root: this.serializeRoute(routerState.root),
      url: routerState.url,
    };
  }

  private serializeRoute(
    route: ActivatedRouteSnapshot
  ): MinimalActivatedRouteSnapshot {
    const children = route.children.map((c) => this.serializeRoute(c));
    return {
      params: route.params,
      data: route.data,
      url: route.url,
      outlet: route.outlet,
      routeConfig: route.routeConfig
        ? {
            path: route.routeConfig.path,
            pathMatch: route.routeConfig.pathMatch,
            redirectTo: route.routeConfig.redirectTo,
            outlet: route.routeConfig.outlet,
          }
        : null,
      queryParams: route.queryParams,
      fragment: route.fragment,
      firstChild: children[0],
      children,
    };
  }
}
