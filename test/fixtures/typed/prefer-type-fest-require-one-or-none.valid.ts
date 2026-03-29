import type { RequireOneOrNone } from "type-fest";

type QueryScope = RequireOneOrNone<QueryScopePayload>;
type QueryScopePayload = Record<"monitorId" | "teamId", string>;

declare const queryScope: QueryScope;

String(queryScope);

export const __typedFixtureModule = "typed-fixture-module";
