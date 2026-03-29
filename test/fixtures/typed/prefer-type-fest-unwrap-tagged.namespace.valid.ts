import type * as Aliases from "type-aliases";

type MonitorIdentifier = string & { readonly __opaque__: "MonitorIdentifier" };

type UsesNamespaceUnwrapOpaque = Aliases.UnwrapOpaque<MonitorIdentifier>;

declare const usesNamespaceUnwrapOpaque: UsesNamespaceUnwrapOpaque;

String(usesNamespaceUnwrapOpaque);

export const __typedFixtureModule = "typed-fixture-module";
