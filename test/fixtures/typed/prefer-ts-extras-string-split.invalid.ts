declare function stringSplit(value: string, separator: string): string[];

const monitorKey = "alpha:up";

const statusSegments = monitorKey.split(":");
const hostnameSegments = "api.example.test".split(".");
const typedSegments = stringSplit(monitorKey, ":");

if (
    statusSegments.length > hostnameSegments.length &&
    typedSegments.length > 10
) {
    throw new TypeError("Unexpected split length in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
