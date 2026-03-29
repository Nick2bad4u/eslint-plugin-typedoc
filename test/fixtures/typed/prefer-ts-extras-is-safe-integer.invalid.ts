declare function isSafeInteger(value: unknown): value is number;

const firstSafeIntegerCheck = Number.isSafeInteger(1);
const secondSafeIntegerCheck = Number.isSafeInteger(Number.NaN);
const typedSafeIntegerCheck = isSafeInteger(1);
if (firstSafeIntegerCheck && secondSafeIntegerCheck && typedSafeIntegerCheck) {
    throw new TypeError("Unexpectedly large monitor count");
}

export const typedFixtureModule = "typed-fixture-module";
