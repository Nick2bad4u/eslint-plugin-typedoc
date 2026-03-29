import type { OneOf, RequireOnlyOne } from "type-aliases";

type AuthByOneOf = OneOf<AuthPayload>;
type AuthByRequireOnlyOne = RequireOnlyOne<AuthPayload>;
type AuthPayload = Record<"apiKey" | "oauthToken" | "sessionToken", string>;

declare const authByOneOf: AuthByOneOf;
declare const authByRequireOnlyOne: AuthByRequireOnlyOne;

String(authByOneOf);
String(authByRequireOnlyOne);

export const __typedFixtureModule = "typed-fixture-module";
