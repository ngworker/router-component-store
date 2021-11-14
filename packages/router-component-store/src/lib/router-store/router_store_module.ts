/**
 * Check if the URLs are matching. Accounts for the possibility of trailing "/" in url.
 */
export function isSameUrl(first: string, second: string): boolean {
  return stripTrailingSlash(first) === stripTrailingSlash(second);
}

function stripTrailingSlash(text: string): string {
  if (text?.length > 0 && text[text.length - 1] === '/') {
    return text.substring(0, text.length - 1);
  }
  return text;
}

export enum RouterTrigger {
  NONE = 1,
  ROUTER = 2,
  STORE = 3,
}
