import type { PickByTypes } from "type-aliases";

interface MonitorPayload {
    readonly errorCode: number;
    readonly id: string;
    readonly region: string;
}

type StringOnlyFields = PickByTypes<MonitorPayload, string>;

declare const stringOnlyFields: StringOnlyFields;

String(stringOnlyFields);

export const __typedFixtureModule = "typed-fixture-module";
