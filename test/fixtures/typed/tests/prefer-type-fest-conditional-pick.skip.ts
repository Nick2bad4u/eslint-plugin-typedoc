import type { PickByTypes } from "type-aliases";

interface MonitorPayload {
    readonly id: string;
}

type ShouldBeSkippedInTestFile = PickByTypes<MonitorPayload, string>;

declare const shouldBeSkippedInTestFile: ShouldBeSkippedInTestFile;

String(shouldBeSkippedInTestFile);

export const __typedFixtureModule = "typed-fixture-module";
