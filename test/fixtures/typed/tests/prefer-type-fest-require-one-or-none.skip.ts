import type { AtMostOne } from "type-aliases";

type QueryScopePayload = Record<"monitorId" | "teamId", string>;
type ShouldBeSkippedInTestFile = AtMostOne<QueryScopePayload>;

declare const shouldBeSkippedInTestFile: ShouldBeSkippedInTestFile;

String(shouldBeSkippedInTestFile);

export const __typedFixtureModule = "typed-fixture-module";
