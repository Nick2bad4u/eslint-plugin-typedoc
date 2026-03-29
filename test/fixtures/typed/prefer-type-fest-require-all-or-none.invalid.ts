import type { AllOrNone, AllOrNothing } from "type-aliases";

type AuthByAllOrNone = AllOrNone<AuthPairPayload>;
type AuthByAllOrNothing = AllOrNothing<AuthPairPayload>;
type AuthPairPayload = Record<"password" | "token" | "username", string>;

declare const authByAllOrNone: AuthByAllOrNone;
declare const authByAllOrNothing: AuthByAllOrNothing;

String(authByAllOrNone);
String(authByAllOrNothing);

export const __typedFixtureModule = "typed-fixture-module";
