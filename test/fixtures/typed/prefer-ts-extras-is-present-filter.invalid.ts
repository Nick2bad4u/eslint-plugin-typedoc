interface MonitorRecord {
    readonly id: string;
}

declare const nullableEntries: readonly (MonitorRecord | null)[];
declare const nullableMonitors: readonly (MonitorRecord | null | undefined)[];
declare const maybeNumbers: readonly (null | number | undefined)[];

const entries = nullableEntries.filter(
    (entry): entry is MonitorRecord => entry !== null
);
const monitors = nullableMonitors.filter(
    (monitor): monitor is MonitorRecord =>
        monitor !== null && monitor !== undefined
);
const numbers = maybeNumbers.filter((value) => value != undefined);

if (entries.length + monitors.length + numbers.length < 0) {
    throw new TypeError("Unreachable total count");
}

export const __typedFixtureModule = "typed-fixture-module";
