import type * as Aliases from "type-aliases";

type AlertDestinationPayload = Record<"email" | "pager" | "slack", string>;
type UsesNamespaceAtLeastOne = Aliases.AtLeastOne<AlertDestinationPayload>;

declare const usesNamespaceAtLeastOne: UsesNamespaceAtLeastOne;

String(usesNamespaceAtLeastOne);

export const __typedFixtureModule = "typed-fixture-module";
