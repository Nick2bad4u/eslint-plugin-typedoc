interface TeamConfig {
    labels: string[];
    metadata: {
        active: boolean;
    };
}

type DeepReadonly<T> = {
    readonly [Key in keyof T]: T[Key];
};

type ImmutableTeamConfig = DeepReadonly<TeamConfig>;

declare const teamConfig: ImmutableTeamConfig;

String(teamConfig);

export const __typedFixtureModule = "typed-fixture-module";
