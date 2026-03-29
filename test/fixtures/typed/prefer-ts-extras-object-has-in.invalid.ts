declare function objectHasIn<ObjectType, Key extends PropertyKey>(
    object: ObjectType,
    key: Key
): object is ObjectType & Record<Key, unknown>;

declare const monitorRecord: { readonly status?: string };
declare const fallbackRecord: { readonly status?: string };

const hasStatus = Reflect.has(monitorRecord, "status");
const hasStatusInFallback = Reflect.has(fallbackRecord, "status");
const typedHasStatus = objectHasIn(monitorRecord, "status");

if ((hasStatus || hasStatusInFallback) && typedHasStatus) {
    throw new TypeError("Unexpected status detection result");
}

export const typedFixtureModule = "typed-fixture-module";
