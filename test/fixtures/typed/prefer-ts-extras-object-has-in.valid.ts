declare function objectHasIn<ObjectType, Key extends PropertyKey>(
    object: ObjectType,
    key: Key
): object is ObjectType & Record<Key, unknown>;

declare const monitorRecord: { readonly status?: string };
declare const fallbackRecord: { readonly status?: string };

const hasStatus = objectHasIn(monitorRecord, "status");
const hasStatusInFallback = objectHasIn(fallbackRecord, "status");

if (hasStatus && hasStatusInFallback) {
    throw new TypeError("Unexpected status detection result");
}

export const typedFixtureModule = "typed-fixture-module";
