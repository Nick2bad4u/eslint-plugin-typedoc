interface MonitorStatus {
    readonly createdAt: Date;
    readonly id: string;
    readonly isUp: boolean;
}

type MonitorStatusPublic = Omit<MonitorStatus, "createdAt">;

interface MonitorSummaryMap {
    readonly alpha: { readonly latencyMs: number; readonly status: "up" };
    readonly beta: { readonly latencyMs: number; readonly status: "down" };
}

type MonitorSummaryPublicMap = Omit<MonitorSummaryMap, "beta">;

declare const publicStatus: MonitorStatusPublic;
declare const publicSummaryMap: MonitorSummaryPublicMap;

if (publicStatus.isUp && "alpha" in publicSummaryMap) {
    throw new TypeError("Unexpected public monitor state");
}

export const __typedFixtureModule = "typed-fixture-module";
