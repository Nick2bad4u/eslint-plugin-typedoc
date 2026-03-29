import type { SetReadonly } from "type-fest";

interface MonitorPayload {
    endpoint: string;
    intervalSeconds: number;
}

type MonitorReadonlyInterval = SetReadonly<MonitorPayload, "intervalSeconds">;

declare const monitorReadonlyInterval: MonitorReadonlyInterval;

String(monitorReadonlyInterval);

export const __typedFixtureModule = "typed-fixture-module";
