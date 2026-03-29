import type { ReadonlyDeep } from "type-fest";

interface TeamConfig {
    labels: string[];
    metadata: {
        active: boolean;
    };
}

type ImmutableTeamConfig = ReadonlyDeep<TeamConfig>;

declare const teamConfig: ImmutableTeamConfig;

String(teamConfig);

export const __typedFixtureModule = "typed-fixture-module";
