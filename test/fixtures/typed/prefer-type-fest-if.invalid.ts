import type {
    IfAny,
    IfEmptyObject,
    IfNever,
    IfNull,
    IfUnknown,
} from "type-aliases";

type ShouldUseIfAny = IfAny<unknown, "yes", "no">;
type ShouldUseIfEmptyObject = IfEmptyObject<Record<string, never>, "yes", "no">;
type ShouldUseIfNever = IfNever<never, "yes", "no">;
type ShouldUseIfNull = IfNull<null, "yes", "no">;
type ShouldUseIfUnknown = IfUnknown<unknown, "yes", "no">;

declare const shouldUseIfAny: ShouldUseIfAny;
declare const shouldUseIfEmptyObject: ShouldUseIfEmptyObject;
declare const shouldUseIfNever: ShouldUseIfNever;
declare const shouldUseIfNull: ShouldUseIfNull;
declare const shouldUseIfUnknown: ShouldUseIfUnknown;

String(shouldUseIfAny);
String(shouldUseIfEmptyObject);
String(shouldUseIfNever);
String(shouldUseIfNull);
String(shouldUseIfUnknown);

export const __typedFixtureModule = "typed-fixture-module";
