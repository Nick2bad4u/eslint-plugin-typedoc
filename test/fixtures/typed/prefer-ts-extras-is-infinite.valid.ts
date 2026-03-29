declare function isInfinite(value: unknown): value is number;

declare const firstMetric: number;
declare const secondMetric: number;

const firstIsInfinite = isInfinite(firstMetric);
const secondIsInfinite = isInfinite(secondMetric);

if (firstIsInfinite && secondIsInfinite) {
    throw new TypeError("Unexpected infinite metric combination");
}

export const typedFixtureModule = "typed-fixture-module";
