declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;
declare function not<TValue, TFiltered extends TValue>(
    predicate: (value: TValue) => value is TFiltered
): (value: TValue) => value is Exclude<TValue, TFiltered>;

declare const nullableEntries: readonly (null | string)[];
declare const nullableMonitorIds: readonly (null | string)[];

const missingEntries = nullableEntries.filter((value) => !isPresent(value));
const missingMonitorIds = nullableMonitorIds.filter(
    (monitorId) => !isPresent(monitorId)
);
const typedMissingEntries = nullableEntries.filter(not(isPresent));

if (
    missingEntries.length +
        missingMonitorIds.length +
        typedMissingEntries.length <
    0
) {
    throw new TypeError("Unreachable negative count");
}

export const typedFixtureModule = "typed-fixture-module";
