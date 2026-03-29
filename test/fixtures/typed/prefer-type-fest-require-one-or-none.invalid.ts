import type { AtMostOne } from "type-aliases";

type QueryScope = AtMostOne<QueryScopePayload>;
type QueryScopePayload = Record<"monitorId" | "teamId", string>;

declare const queryScope: QueryScope;

String(queryScope);

export const __typedFixtureModule = "typed-fixture-module";
