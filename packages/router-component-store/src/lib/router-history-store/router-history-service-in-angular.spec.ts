import {
  Event as NgRouterEvent,
  NavigationEnd,
  NavigationStart,
} from '@angular/router';

export const routerEvents: readonly NgRouterEvent[] = [
  // 1. Navigate to the root path ‘/’, which redirects me to the homepage
  // Current: Home
  // Previous: None
  // Next: None
  new NavigationStart(1, '/', 'imperative', null),
  new NavigationEnd(1, '/', '/home'),

  // 2. Click a menu link to navigate to the About page
  // Current: About
  // Previous: Home
  // Next: None
  new NavigationStart(2, '/about', 'imperative', null),
  new NavigationEnd(2, '/about', '/about'),

  // 3. Click a menu link to navigate to the Company page
  // Current: Company
  // Previous About
  // Next: None
  new NavigationStart(3, '/company', 'imperative', null),
  new NavigationEnd(3, '/company', '/company'),

  // 4. Click the back button
  // Current: About
  // Previous: Home
  // Next: Company
  new NavigationStart(4, '/about', 'popstate', { navigationId: 2 }),
  new NavigationEnd(4, '/about', '/about'),

  // 5. Click a menu link to navigate to the Products page
  // Current: Products
  // Previous: About
  // Next: None
  new NavigationStart(5, '/products', 'imperative', null),
  new NavigationEnd(5, '/products', '/products'),

  // 6. Click a menu link to navigate to the Home page
  // Current: Home
  // Previous: Products
  // Next: None
  new NavigationStart(6, '/home', 'imperative', null),
  new NavigationEnd(6, '/home', '/home'),

  // 7. Click a menu link to navigate to the About page
  // Current: About
  // Previous: Home
  // Next: None
  new NavigationStart(7, '/about', 'imperative', null),
  new NavigationEnd(7, '/about', '/about'),

  // 8. Click the back button
  // Current: Home
  // Previous: Products
  // Next: About
  new NavigationStart(8, '/home', 'popstate', { navigationId: 6 }),
  new NavigationEnd(8, '/home', '/home'),

  // 9. Click the forward button
  // Current: About
  // Previous: Home
  // Next: None
  new NavigationStart(9, '/about', 'popstate', { navigationId: 7 }),
  new NavigationEnd(9, '/about', '/about'),

  // 10. Click the back button
  // Current: Home
  // Previous: Products
  // Next: About
  new NavigationStart(10, '/home', 'popstate', { navigationId: 8 }),
  new NavigationEnd(10, '/home', '/home'),
];
