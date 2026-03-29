import type * as Aliases from "type-aliases";

type AccountByNamespaceAlias = Aliases.NonNullableBy<AccountPayload, "token">;

interface AccountPayload {
    accountId: string;
    token: null | string;
}

declare const accountByNamespaceAlias: AccountByNamespaceAlias;

String(accountByNamespaceAlias);

export const __typedFixtureModule = "typed-fixture-module";
