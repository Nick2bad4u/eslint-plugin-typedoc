type CachePrimitive =
    | bigint
    | boolean
    | null
    | number
    | string
    | symbol
    | undefined;

type EnvPrimitive =
    | bigint
    | boolean
    | null
    | number
    | string
    | symbol
    | undefined;

declare function cachePrimitive(value: CachePrimitive): void;
declare function serializePrimitive(value: EnvPrimitive): string;

cachePrimitive("alpha");
serializePrimitive(42);

export const typedFixtureModule = "typed-fixture-module";
