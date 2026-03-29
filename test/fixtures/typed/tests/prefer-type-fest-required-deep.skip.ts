interface TeamConfig {
    labels?: string[];
    metadata?: {
        active?: boolean;
    };
}

type DeepRequired<T> = {
    [Key in keyof T]-?: T[Key];
};

type StrictTeamConfig = DeepRequired<TeamConfig>;

declare const teamConfig: StrictTeamConfig;

String(teamConfig);

export const __typedFixtureModule = "typed-fixture-module";
