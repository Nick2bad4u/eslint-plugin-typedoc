declare function assertError(value: unknown): asserts value is Error;

declare const firstErrorLike: unknown;
declare const secondErrorLike: unknown;

if (!(firstErrorLike instanceof Error)) {
    throw new TypeError("first error value required");
}

if (!(secondErrorLike instanceof Error)) {
    throw new TypeError("second error value required");
}

assertError(firstErrorLike);

export const typedFixtureModule = "typed-fixture-module";
