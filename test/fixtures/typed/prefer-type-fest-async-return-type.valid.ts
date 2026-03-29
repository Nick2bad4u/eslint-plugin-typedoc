import type { AsyncReturnType } from "type-fest";

type MonitorProbe = () => Promise<boolean>;
type MonitorProbeResult = AsyncReturnType<MonitorProbe>;

type MonitorSummary = AsyncReturnType<typeof loadMonitorSummary>;

function loadMonitorSummary(): Promise<{ id: "alpha"; latencyMs: 123 }> {
    return Promise.resolve({
        id: "alpha",
        latencyMs: 123,
    } as const);
}

declare const probeResult: MonitorProbeResult;
declare const monitorSummary: MonitorSummary;

const monitorSummaryPromise = loadMonitorSummary();

if (
    monitorSummaryPromise instanceof Promise &&
    !probeResult &&
    monitorSummary.latencyMs < 0
) {
    throw new TypeError("Unexpected monitor summary latency");
}

export const __typedFixtureModule = "typed-fixture-module";
