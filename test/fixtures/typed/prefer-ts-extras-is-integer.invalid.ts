declare function isInteger(value: unknown): value is number;

const firstIntegerCheck = Number.isInteger(1);
const secondIntegerCheck = Number.isInteger(Number.NaN);
const typedIntegerCheck = isInteger(1);
if (firstIntegerCheck && secondIntegerCheck && typedIntegerCheck) {
    throw new TypeError("Unexpectedly large retry count");
}

export const typedFixtureModule = "typed-fixture-module";
