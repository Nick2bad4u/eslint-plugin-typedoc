import type { SetElement } from "type-aliases";

type MonitorIdSet = Set<string>;
type ShouldBeSkippedInTestFile = SetElement<MonitorIdSet>;

declare const shouldBeSkippedInTestFile: ShouldBeSkippedInTestFile;

String(shouldBeSkippedInTestFile);

export const __typedFixtureModule = "typed-fixture-module";
