import type { RecordDeep } from "type-aliases";

type EnvironmentTemplate = Record<"api" | "dashboard", string>;
type ShouldBeSkippedInTestFile = RecordDeep<EnvironmentTemplate, string>;

declare const shouldBeSkippedInTestFile: ShouldBeSkippedInTestFile;

String(shouldBeSkippedInTestFile);

export const __typedFixtureModule = "typed-fixture-module";
