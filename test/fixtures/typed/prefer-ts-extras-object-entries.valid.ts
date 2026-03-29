interface MonitorState {
    readonly isUp: boolean;
    readonly statusCode: number;
}

declare function objectEntries<TObject extends object>(
    value: TObject
): [PropertyKey, TObject[keyof TObject]][];

const monitorStateById: Readonly<Record<string, MonitorState>> = {
    alpha: { isUp: true, statusCode: 200 },
    beta: { isUp: false, statusCode: 500 },
};

const monitorEntries = objectEntries(monitorStateById);

if (monitorEntries.length > 10) {
    throw new TypeError("Unexpected monitor entries count");
}

export const typedFixtureModule = "typed-fixture-module";
