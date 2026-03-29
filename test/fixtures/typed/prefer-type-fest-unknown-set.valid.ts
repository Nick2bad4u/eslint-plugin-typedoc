import type { UnknownSet } from "type-fest";

type MonitorIdSet = UnknownSet;
type PayloadKeySet = UnknownSet;

declare const monitorIdSet: MonitorIdSet;
declare const payloadKeySet: PayloadKeySet;

if (monitorIdSet.size === payloadKeySet.size && monitorIdSet.size > 999) {
    throw new TypeError("Unexpectedly large monitor identifier set");
}

export const __typedFixtureModule = "typed-fixture-module";
