import type { ReadonlyBy } from "type-aliases";

type MonitorByAlias = ReadonlyBy<MonitorPayload, "intervalSeconds">;

interface MonitorPayload {
    endpoint: string;
    intervalSeconds: number;
}

declare const monitorByAlias: MonitorByAlias;

String(monitorByAlias);

export const __typedFixtureModule = "typed-fixture-module";
