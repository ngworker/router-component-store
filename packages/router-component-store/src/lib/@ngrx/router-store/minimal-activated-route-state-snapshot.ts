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
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ActivatedRouteSnapshot } from '@angular/router';
import { StrictRouteData } from '../../strict-route-data';
import { StrictRouteParams } from '../../strict-route-params';

/**
 * Contains the information about a route associated with a component loaded in
 * an outlet at a particular moment in time. MinimalActivatedRouteSnapshot can
 * also be used to traverse the router state tree.
 */
export interface MinimalActivatedRouteSnapshot {
  /**
   * The configuration used to match this route.
   */
  readonly routeConfig: ActivatedRouteSnapshot['routeConfig'];
  /**
   * The URL segments matched by this route.
   */
  readonly url: ActivatedRouteSnapshot['url'];
  /**
   * The matrix parameters scoped to this route.
   */
  readonly params: StrictRouteParams;
  /**
   * The query parameters shared by all the routes.
   */
  readonly queryParams: ActivatedRouteSnapshot['queryParams'];
  /**
   * The URL fragment shared by all the routes.
   */
  readonly fragment: ActivatedRouteSnapshot['fragment'];
  /**
   * The static and resolved data of this route.
   *
   * @remarks
   * Contains serializable route `Data` without its symbol index, in particular
   * without the `Symbol.for(RouteTitle)` key as this is an internal value for
   * the Angular `Router`. Instead, we access the resolved route title through
   * `MinimalActivatedRouteSnapshot['title']`.
   */
  readonly data: StrictRouteData;
  /**
   * The outlet name of the route.
   */
  readonly outlet: ActivatedRouteSnapshot['outlet'];
  /**
   * The resolved route title.
   */
  readonly title: ActivatedRouteSnapshot['title'];
  /**
   * The first child of this route in the router state tree
   */
  readonly firstChild?: MinimalActivatedRouteSnapshot;
  /**
   * The children of this route in the router state tree.
   */
  readonly children: MinimalActivatedRouteSnapshot[];
}
