import type { SetNonNullable } from "type-fest";

interface AccountPayload {
    accountId: string;
    token: null | string;
}

type AccountWithToken = SetNonNullable<AccountPayload, "token">;

declare const accountWithToken: AccountWithToken;

String(accountWithToken);

export const __typedFixtureModule = "typed-fixture-module";
