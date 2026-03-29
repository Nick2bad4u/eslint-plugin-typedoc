declare function stringSplit(value: string, separator: string): string[];

const monitorKey = "alpha:up";

const segments = stringSplit(monitorKey, ":");

if (segments.length > 10) {
    throw new TypeError("Unexpected split length in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
