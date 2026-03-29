import type * as Aliases from "type-aliases";

type QueryScopePayload = Record<"monitorId" | "teamId", string>;
type UsesNamespaceRequireOneOrNone = Aliases.AtMostOne<QueryScopePayload>;

declare const usesNamespaceRequireOneOrNone: UsesNamespaceRequireOneOrNone;

String(usesNamespaceRequireOneOrNone);

export const __typedFixtureModule = "typed-fixture-module";
