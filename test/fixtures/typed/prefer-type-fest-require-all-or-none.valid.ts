import type { RequireAllOrNone } from "type-fest";

type AuthPair = RequireAllOrNone<AuthPairPayload, "password" | "username">;
type AuthPairPayload = Record<"password" | "token" | "username", string>;

declare const authPair: AuthPair;

String(authPair);

export const __typedFixtureModule = "typed-fixture-module";
