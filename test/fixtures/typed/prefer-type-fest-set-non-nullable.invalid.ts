import type { NonNullableBy } from "type-aliases";

type AccountByAlias = NonNullableBy<AccountPayload, "token">;

interface AccountPayload {
    accountId: string;
    token: null | string;
}

declare const accountByAlias: AccountByAlias;

String(accountByAlias);

export const __typedFixtureModule = "typed-fixture-module";
