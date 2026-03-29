import type { AtLeastOne } from "type-aliases";

type AlertDestination = AtLeastOne<AlertDestinationPayload>;
type AlertDestinationPayload = Record<"email" | "pager" | "slack", string>;

declare const alertDestination: AlertDestination;

String(alertDestination);

export const __typedFixtureModule = "typed-fixture-module";
