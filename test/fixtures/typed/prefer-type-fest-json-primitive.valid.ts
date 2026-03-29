import type { JsonPrimitive } from "type-fest";

type CacheJsonPrimitive = JsonPrimitive;
type EnvJsonPrimitive = JsonPrimitive;

declare function cachePrimitive(value: CacheJsonPrimitive): void;
declare function serializePrimitive(value: EnvJsonPrimitive): string;

cachePrimitive(true);
serializePrimitive("ok");

export const typedFixtureModule = "typed-fixture-module";
