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

const keys = Object.keys(monitorConfig);
const secondKeys = Object.keys(monitorConfig);
const typedKeys = objectKeys(monitorConfig);

if (keys.length + secondKeys.length + typedKeys.length > 10) {
    throw new TypeError("Unexpected key count");
}

export const typedFixtureModule = "typed-fixture-module";
