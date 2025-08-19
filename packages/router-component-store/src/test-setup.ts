// Review when migrating to `jest-preset-angular` 14.3, that is around Nx 20.2
// @ts-expect-error https://thymikee.github.io/jest-preset-angular/docs/14.2/getting-started/test-environment
globalThis.ngJest = {
  testEnvironmentOptions: {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
  },
};
import 'jest-preset-angular/setup-jest';
