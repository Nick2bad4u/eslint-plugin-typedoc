import type {
    If,
    IsAny,
    IsEmptyObject,
    IsNever,
    IsNull,
    IsUnknown,
} from "type-fest";

type UsesIfAnyPattern = If<IsAny<unknown>, "yes", "no">;
type UsesIfEmptyObjectPattern = If<
    IsEmptyObject<Record<string, never>>,
    "yes",
    "no"
>;
type UsesIfNeverPattern = If<IsNever<never>, "yes", "no">;
type UsesIfNullPattern = If<IsNull<null>, "yes", "no">;
type UsesIfUnknownPattern = If<IsUnknown<unknown>, "yes", "no">;

declare const usesIfAnyPattern: UsesIfAnyPattern;
declare const usesIfEmptyObjectPattern: UsesIfEmptyObjectPattern;
declare const usesIfNeverPattern: UsesIfNeverPattern;
declare const usesIfNullPattern: UsesIfNullPattern;
declare const usesIfUnknownPattern: UsesIfUnknownPattern;

String(usesIfAnyPattern);
String(usesIfEmptyObjectPattern);
String(usesIfNeverPattern);
String(usesIfNullPattern);
String(usesIfUnknownPattern);

export const __typedFixtureModule = "typed-fixture-module";
