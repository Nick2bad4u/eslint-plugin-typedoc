import type { SetOptional } from "type-fest";

type MonitorDraft = SetOptional<MonitorRecord, "latencyMs">;
type MonitorRecord = Record<"id" | "latencyMs", number | string>;

declare const monitorDraft: MonitorDraft;

String(monitorDraft);

export const __typedFixtureModule = "typed-fixture-module";
