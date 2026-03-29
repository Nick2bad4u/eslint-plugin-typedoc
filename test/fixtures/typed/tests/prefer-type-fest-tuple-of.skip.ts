import type { ReadonlyTuple } from "type-aliases";

type ShouldBeSkippedInTestFile = ReadonlyTuple<string, 3>;

declare const shouldBeSkippedInTestFile: ShouldBeSkippedInTestFile;

String(shouldBeSkippedInTestFile);

export const __typedFixtureModule = "typed-fixture-module";
