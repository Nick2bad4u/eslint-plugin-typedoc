import type { OneOf } from "type-aliases";

type AuthPayload = Record<"apiKey" | "oauthToken" | "sessionToken", string>;
type ShouldBeSkippedInTestFile = OneOf<AuthPayload>;

declare const shouldBeSkippedInTestFile: ShouldBeSkippedInTestFile;

String(shouldBeSkippedInTestFile);

export const __typedFixtureModule = "typed-fixture-module";
