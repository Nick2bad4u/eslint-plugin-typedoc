import type { JsonArray } from "type-fest";

type MonitorPayloadArray = JsonArray;
type MonitorPayloadArrayViaGeneric = JsonArray;

declare function handlePayloadArray(value: MonitorPayloadArray): void;
declare function handlePayloadArrayGeneric(
    value: MonitorPayloadArrayViaGeneric
): void;

handlePayloadArray([{ healthy: true }]);
handlePayloadArrayGeneric([{ healthy: false }]);

export const typedFixtureModule = "typed-fixture-module";
