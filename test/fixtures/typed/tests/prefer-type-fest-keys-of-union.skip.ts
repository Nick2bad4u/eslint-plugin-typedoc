import type { AllKeys } from "type-aliases";

type MonitorResponseUnion =
    | { readonly id: string; readonly reason: string; readonly status: "down" }
    | { readonly id: string; readonly status: "up" };
type ShouldBeSkippedInTestFile = AllKeys<MonitorResponseUnion>;

declare const shouldBeSkippedInTestFile: ShouldBeSkippedInTestFile;

String(shouldBeSkippedInTestFile);

export const __typedFixtureModule = "typed-fixture-module";
