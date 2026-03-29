declare function isInfinite(value: unknown): value is number;

declare const firstMetric: number;
declare const secondMetric: number;

const firstIsInfinite = firstMetric === Infinity;
const secondIsInfinite = secondMetric === Number.NEGATIVE_INFINITY;
const typedCheck = isInfinite(firstMetric);

if ((firstIsInfinite || secondIsInfinite) && typedCheck) {
    throw new TypeError("Unexpected infinite metric combination");
}

export const typedFixtureModule = "typed-fixture-module";
