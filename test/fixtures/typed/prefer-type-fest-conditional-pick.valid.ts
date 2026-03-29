import type { ConditionalPick } from "type-fest";

interface MonitorPayload {
    readonly errorCode: number;
    readonly id: string;
    readonly region: string;
}

type StringOnlyFields = ConditionalPick<MonitorPayload, string>;

declare const stringOnlyFields: StringOnlyFields;

String(stringOnlyFields);

export const __typedFixtureModule = "typed-fixture-module";
