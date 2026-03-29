import type * as Aliases from "type-aliases";

type AuthPayload = Record<"apiKey" | "oauthToken" | "sessionToken", string>;
type UsesNamespaceRequireExactlyOne = Aliases.OneOf<AuthPayload>;

declare const usesNamespaceRequireExactlyOne: UsesNamespaceRequireExactlyOne;

String(usesNamespaceRequireExactlyOne);

export const __typedFixtureModule = "typed-fixture-module";
