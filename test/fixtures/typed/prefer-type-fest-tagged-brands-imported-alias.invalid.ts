import type { Branded, Opaque } from "ts-essentials";

type AccountIdentifier = Opaque<string, "AccountIdentifier">;
type SessionIdentifier = Branded<string, "SessionIdentifier">;

declare const accountId: AccountIdentifier;
declare const sessionId: SessionIdentifier;

String(accountId);
String(sessionId);

export const __typedFixtureModule = "typed-fixture-module";
