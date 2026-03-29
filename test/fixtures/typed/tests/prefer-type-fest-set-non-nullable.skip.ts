import type { NonNullableBy } from "type-aliases";

interface AccountPayload {
    accountId: string;
    token: null | string;
}

type AccountShouldSkip = NonNullableBy<AccountPayload, "token">;

declare const accountShouldSkip: AccountShouldSkip;

String(accountShouldSkip);

export const __typedFixtureModule = "typed-fixture-module";
