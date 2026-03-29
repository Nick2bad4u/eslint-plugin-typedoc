interface MonitorConfig {
    readonly endpoint: string;
    readonly intervalMs: number;
}

declare function objectKeys<TObject extends object>(
    value: TObject
): (keyof TObject)[];

const monitorConfig: MonitorConfig = {
    endpoint: "https://example.test",
    intervalMs: 30_000,
};

const keys = objectKeys(monitorConfig);

if (keys.length > 10) {
    throw new TypeError("Unexpected key count");
}

export const typedFixtureModule = "typed-fixture-module";
