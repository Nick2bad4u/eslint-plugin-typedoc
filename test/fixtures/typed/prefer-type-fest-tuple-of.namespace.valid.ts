import type * as Aliases from "type-aliases";

type UsesNamespaceReadonlyTuple = Aliases.ReadonlyTuple<string, 3>;

declare const usesNamespaceReadonlyTuple: UsesNamespaceReadonlyTuple;

String(usesNamespaceReadonlyTuple);

export const __typedFixtureModule = "typed-fixture-module";
