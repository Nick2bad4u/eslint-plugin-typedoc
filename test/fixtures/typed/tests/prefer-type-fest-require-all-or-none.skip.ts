import type { AllOrNone } from "type-aliases";

type AuthPairPayload = Record<"password" | "token" | "username", string>;
type ShouldBeSkippedInTestFile = AllOrNone<AuthPairPayload>;

declare const shouldBeSkippedInTestFile: ShouldBeSkippedInTestFile;

String(shouldBeSkippedInTestFile);

export const __typedFixtureModule = "typed-fixture-module";
