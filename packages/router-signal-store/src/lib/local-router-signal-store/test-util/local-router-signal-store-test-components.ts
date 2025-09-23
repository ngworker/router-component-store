import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { provideLocalRouterSignalStore } from '../provide-local-router-signal-store';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngw-test-localroutersignalstore-child',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  viewProviders: [provideLocalRouterSignalStore()],
})
export class LocalRouterSignalStoreTestChildComponent {}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngw-test-localroutersignalstore-grandchild',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  viewProviders: [provideLocalRouterSignalStore()],
})
export class LocalRouterSignalStoreTestGrandchildComponent {}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngw-test-localroutersignalstore-parent',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  viewProviders: [provideLocalRouterSignalStore()],
})
export class LocalRouterSignalStoreTestParentComponent {}
