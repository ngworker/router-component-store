import { inject, InjectOptions } from '@angular/core';
import { RouterStore } from '../router-store';

/**
 * Inject a local {@link RouterStore} from the providers of the current
 * component, directive, or any of its ancestors in the active component
 * tree.
 *
 * @returns The local {@link RouterStore} provided closest to the
 *   current component or directive.
 */
export function injectLocalRouterStore(
  injectOptions?: Omit<InjectOptions, 'host'> & { optional?: false }
): RouterStore;
export function injectLocalRouterStore(
  injectOptions?: Omit<InjectOptions, 'host'>
): RouterStore | null;
export function injectLocalRouterStore(
  injectOptions?: Omit<InjectOptions, 'host'>
): RouterStore | null {
  return inject(RouterStore, { ...injectOptions, host: true });
}
