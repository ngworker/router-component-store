import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngw-test-globalroutersignalstore-child',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class GlobalRouterSignalStoreTestChildComponent {}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngw-test-globalroutersignalstore-grandchild',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class GlobalRouterSignalStoreTestGrandchildComponent {}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngw-test-globalroutersignalstore-parent',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class GlobalRouterSignalStoreTestParentComponent {}
