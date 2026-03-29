import type { IfAny } from "type-aliases";

type ShouldBeSkippedInTestFile = IfAny<unknown, "yes", "no">;

declare const shouldBeSkippedInTestFile: ShouldBeSkippedInTestFile;

String(shouldBeSkippedInTestFile);

export const __typedFixtureModule = "typed-fixture-module";
