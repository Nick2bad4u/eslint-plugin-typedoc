import type * as Aliases from "type-aliases";

interface MonitorPayload {
    readonly errorCode: number;
    readonly id: string;
    readonly region: string;
}

type UsesNamespaceConditionalPick = Aliases.PickByTypes<MonitorPayload, string>;

declare const usesNamespaceConditionalPick: UsesNamespaceConditionalPick;

String(usesNamespaceConditionalPick);

export const __typedFixtureModule = "typed-fixture-module";
