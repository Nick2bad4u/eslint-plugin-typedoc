import type { Primitive } from "type-fest";

type CachePrimitive = Primitive;
type EnvPrimitive = Primitive;

declare function cachePrimitive(value: CachePrimitive): void;
declare function serializePrimitive(value: EnvPrimitive): string;

cachePrimitive("alpha");
serializePrimitive(42);

export const typedFixtureModule = "typed-fixture-module";
