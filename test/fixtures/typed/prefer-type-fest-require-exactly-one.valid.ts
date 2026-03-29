import type { RequireExactlyOne } from "type-fest";

type AuthPayload = Record<"apiKey" | "oauthToken" | "sessionToken", string>;
type AuthWithSingleToken = RequireExactlyOne<AuthPayload>;

declare const authWithSingleToken: AuthWithSingleToken;

String(authWithSingleToken);

export const __typedFixtureModule = "typed-fixture-module";
