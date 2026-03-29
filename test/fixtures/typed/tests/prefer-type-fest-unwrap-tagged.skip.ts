import type { UnwrapOpaque } from "type-aliases";

type MonitorIdentifier = string & { readonly __opaque__: "MonitorIdentifier" };

type ShouldBeSkippedInTestFile = UnwrapOpaque<MonitorIdentifier>;

declare const shouldBeSkippedInTestFile: ShouldBeSkippedInTestFile;

String(shouldBeSkippedInTestFile);

export const __typedFixtureModule = "typed-fixture-module";
