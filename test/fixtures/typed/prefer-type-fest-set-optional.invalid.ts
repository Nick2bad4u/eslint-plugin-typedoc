import type { PartialBy } from "type-aliases";

type MonitorDraft = PartialBy<MonitorRecord, "latencyMs">;
type MonitorRecord = Record<"id" | "latencyMs", number | string>;

declare const monitorDraft: MonitorDraft;

String(monitorDraft);

export const __typedFixtureModule = "typed-fixture-module";
