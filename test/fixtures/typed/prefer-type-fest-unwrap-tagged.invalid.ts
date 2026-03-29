import type { UnwrapOpaque } from "type-aliases";

type MonitorIdentifier = string & { readonly __opaque__: "MonitorIdentifier" };

type PlainMonitorIdentifier = UnwrapOpaque<MonitorIdentifier>;

declare const plainMonitorIdentifier: PlainMonitorIdentifier;

String(plainMonitorIdentifier);

export const __typedFixtureModule = "typed-fixture-module";
