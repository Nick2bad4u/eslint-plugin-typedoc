const monitorStatuses = ["down", "up"] as const;

const lastStatus = monitorStatuses[monitorStatuses.length - 1];

String(lastStatus);

export const typedFixtureModule = "typed-fixture-module";
