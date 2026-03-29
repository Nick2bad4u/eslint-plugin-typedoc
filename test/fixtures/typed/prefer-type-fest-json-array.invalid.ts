import type { JsonValue } from "type-fest";

type MonitorPayloadArray = JsonValue[] | readonly JsonValue[];
type MonitorPayloadArrayViaGeneric =
    | Array<JsonValue>
    | ReadonlyArray<JsonValue>;

declare function handlePayloadArray(value: MonitorPayloadArray): void;
declare function handlePayloadArrayGeneric(
    value: MonitorPayloadArrayViaGeneric
): void;

handlePayloadArray([{ healthy: true }]);
handlePayloadArrayGeneric([{ healthy: false }]);

export const typedFixtureModule = "typed-fixture-module";
