type CacheJsonPrimitive = boolean | null | number | string;
type EnvJsonPrimitive = boolean | null | number | string;

declare function cachePrimitive(value: CacheJsonPrimitive): void;
declare function serializePrimitive(value: EnvJsonPrimitive): string;

cachePrimitive(true);
serializePrimitive("ok");

export const typedFixtureModule = "typed-fixture-module";
