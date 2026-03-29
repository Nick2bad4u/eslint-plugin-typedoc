import type { UnionMember } from "type-fest";

type LastEventName = UnionMember<"open" | "close" | "reset">;

declare const lastEventName: LastEventName;

String(lastEventName);

export const __typedFixtureModule = "typed-fixture-module";
