declare function isFinite(value: unknown): value is number;

const firstFiniteCheck = Number.isFinite(1);
const secondFiniteCheck = Number.isFinite(Number.NaN);
const typedFiniteCheck = isFinite(1);
if (firstFiniteCheck && secondFiniteCheck && typedFiniteCheck) {
    throw new TypeError("Unexpectedly large metric sum");
}

export const typedFixtureModule = "typed-fixture-module";
