import type * as Aliases from "type-aliases";

type AuthPairPayload = Record<"password" | "token" | "username", string>;
type UsesNamespaceAllOrNone = Aliases.AllOrNone<AuthPairPayload>;

declare const usesNamespaceAllOrNone: UsesNamespaceAllOrNone;

String(usesNamespaceAllOrNone);

export const __typedFixtureModule = "typed-fixture-module";
