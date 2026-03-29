import type * as Aliases from "type-aliases";

type MonitorByNamespaceAlias = Aliases.ReadonlyBy<
    MonitorPayload,
    "intervalSeconds"
>;

interface MonitorPayload {
    endpoint: string;
    intervalSeconds: number;
}

declare const monitorByNamespaceAlias: MonitorByNamespaceAlias;

String(monitorByNamespaceAlias);

export const __typedFixtureModule = "typed-fixture-module";
