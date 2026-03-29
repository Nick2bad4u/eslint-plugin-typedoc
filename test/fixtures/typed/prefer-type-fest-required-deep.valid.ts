import type { RequiredDeep } from "type-fest";

interface TeamConfig {
    labels?: string[];
    metadata?: {
        active?: boolean;
    };
}

type StrictTeamConfig = RequiredDeep<TeamConfig>;

declare const teamConfig: StrictTeamConfig;

String(teamConfig);

export const __typedFixtureModule = "typed-fixture-module";
