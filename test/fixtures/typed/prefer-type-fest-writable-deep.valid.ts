import type { WritableDeep } from "type-fest";

interface TeamConfig {
    readonly labels: readonly string[];
    readonly metadata: {
        readonly active: boolean;
    };
}

type MutableTeamConfig = WritableDeep<TeamConfig>;

declare const teamConfig: MutableTeamConfig;

String(teamConfig);

export const __typedFixtureModule = "typed-fixture-module";
