import type * as Aliases from "type-aliases";

type MonitorResponseUnion =
    | { readonly id: string; readonly reason: string; readonly status: "down" }
    | { readonly id: string; readonly status: "up" };
type UsesNamespaceAllKeys = Aliases.AllKeys<MonitorResponseUnion>;

declare const usesNamespaceAllKeys: UsesNamespaceAllKeys;

String(usesNamespaceAllKeys);

export const __typedFixtureModule = "typed-fixture-module";
