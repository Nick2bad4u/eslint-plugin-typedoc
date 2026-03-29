import type { PartialDeep } from "type-fest";

interface TeamConfig {
    labels: string[];
    metadata: {
        active: boolean;
    };
}

type TeamConfigPatch = PartialDeep<TeamConfig>;

declare const teamConfigPatch: TeamConfigPatch;

String(teamConfigPatch);

export const __typedFixtureModule = "typed-fixture-module";
