import type * as Aliases from "type-aliases";

type UsesNamespaceIfAny = Aliases.IfAny<unknown, "yes", "no">;

declare const usesNamespaceIfAny: UsesNamespaceIfAny;

String(usesNamespaceIfAny);

export const __typedFixtureModule = "typed-fixture-module";
