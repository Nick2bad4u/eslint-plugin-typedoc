import type * as Aliases from "type-aliases";

type MonitorIdSet = Set<string>;

type UsesNamespaceSetElement = Aliases.SetElement<MonitorIdSet>;

declare const usesNamespaceSetElement: UsesNamespaceSetElement;

String(usesNamespaceSetElement);

export const __typedFixtureModule = "typed-fixture-module";
