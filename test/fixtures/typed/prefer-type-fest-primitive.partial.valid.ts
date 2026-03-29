type PartialPrimitive = bigint | boolean | null | number | string | undefined;

declare const partialPrimitive: PartialPrimitive;

String(partialPrimitive);

export const typedFixtureModule = "typed-fixture-module";
