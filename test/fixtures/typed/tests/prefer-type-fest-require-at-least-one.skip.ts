import type { AtLeastOne } from "type-aliases";

type AlertDestinationPayload = Record<"email" | "pager" | "slack", string>;
type ShouldBeSkippedInTestFile = AtLeastOne<AlertDestinationPayload>;

declare const shouldBeSkippedInTestFile: ShouldBeSkippedInTestFile;

String(shouldBeSkippedInTestFile);

export const __typedFixtureModule = "typed-fixture-module";
