import type { KeysOfUnion } from "type-fest";

type MonitorKeyUnion = KeysOfUnion<MonitorResponseUnion>;
type MonitorResponseUnion =
    | { readonly id: string; readonly reason: string; readonly status: "down" }
    | { readonly id: string; readonly status: "up" };

declare const monitorKey: MonitorKeyUnion;

String(monitorKey);

export const __typedFixtureModule = "typed-fixture-module";
