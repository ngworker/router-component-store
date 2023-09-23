import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngw-test-globalrouterstore-child',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class GlobalRouterStoreTestChildComponent {}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngw-test-globalrouterstore-grandchild',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class GlobalRouterStoreTestGrandchildComponent {}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngw-test-globalrouterstore-parent',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class GlobalRouterStoreTestParentComponent {}
