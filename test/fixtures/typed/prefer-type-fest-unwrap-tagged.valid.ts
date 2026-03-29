import type { Tagged, UnwrapTagged } from "type-fest";

type MonitorIdentifier = Tagged<string, "MonitorIdentifier">;

type PlainMonitorIdentifier = UnwrapTagged<MonitorIdentifier>;

declare const plainMonitorIdentifier: PlainMonitorIdentifier;

String(plainMonitorIdentifier);

export const __typedFixtureModule = "typed-fixture-module";
