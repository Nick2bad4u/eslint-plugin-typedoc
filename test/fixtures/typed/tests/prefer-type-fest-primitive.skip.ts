type SkippedPrimitive =
    | bigint
    | boolean
    | null
    | number
    | string
    | symbol
    | undefined;

declare const skippedPrimitive: SkippedPrimitive;

String(skippedPrimitive);

export const typedFixtureModule = "typed-fixture-module";
