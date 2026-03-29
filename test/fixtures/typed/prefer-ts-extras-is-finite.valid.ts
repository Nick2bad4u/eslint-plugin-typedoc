declare function isFinite(value: unknown): value is number;

const firstMetric: unknown = 1;
const secondMetric: unknown = 2;

if (isFinite(firstMetric) && isFinite(secondMetric)) {
    const totalMetric = firstMetric + secondMetric;
    if (totalMetric > 1000) {
        throw new TypeError("Unexpectedly large metric sum");
    }
}

export const typedFixtureModule = "typed-fixture-module";
