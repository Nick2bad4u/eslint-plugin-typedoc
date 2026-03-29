import type { RequireAtLeastOne } from "type-fest";

type AlertDestination = RequireAtLeastOne<AlertDestinationPayload>;
type AlertDestinationPayload = Record<"email" | "pager" | "slack", string>;

declare const alertDestination: AlertDestination;

String(alertDestination);

export const __typedFixtureModule = "typed-fixture-module";
