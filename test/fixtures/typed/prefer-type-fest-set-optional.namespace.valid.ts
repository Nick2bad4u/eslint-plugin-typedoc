import type * as Aliases from "type-aliases";

type MonitorRecord = Record<"id" | "latencyMs", number | string>;
type UsesNamespaceSetOptional = Aliases.PartialBy<MonitorRecord, "latencyMs">;

declare const usesNamespaceSetOptional: UsesNamespaceSetOptional;

String(usesNamespaceSetOptional);

export const __typedFixtureModule = "typed-fixture-module";
