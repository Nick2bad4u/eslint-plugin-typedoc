declare function assertError(value: unknown): asserts value is Error;

declare const firstErrorLike: unknown;
declare const secondErrorLike: unknown;

assertError(firstErrorLike);
assertError(secondErrorLike);

export const typedFixtureModule = "typed-fixture-module";
