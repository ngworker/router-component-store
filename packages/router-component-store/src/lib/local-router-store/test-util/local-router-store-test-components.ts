import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { provideLocalRouterStore } from '../provide-local-router-store';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngw-test-localrouterstore-child',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  viewProviders: [provideLocalRouterStore(), ComponentStore],
})
export class LocalRouterStoreTestChildComponent {}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngw-test-localrouterstore-grandchild',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  viewProviders: [provideLocalRouterStore(), ComponentStore],
})
export class LocalRouterStoreTestGrandchildComponent {}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngw-test-localrouterstore-parent',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  viewProviders: [provideLocalRouterStore(), ComponentStore],
})
export class LocalRouterStoreTestParentComponent {}
