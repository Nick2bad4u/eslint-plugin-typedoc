interface MonitorStatusById {
    readonly alpha: "down" | "up";
    readonly beta: "down" | "up";
}

declare function objectValues<TObject extends object>(
    value: TObject
): TObject[keyof TObject][];

const monitorStatusById: MonitorStatusById = {
    alpha: "up",
    beta: "down",
};

const values = objectValues(monitorStatusById);

if (values.length > 10) {
    throw new TypeError("Unexpected values count");
}

export const typedFixtureModule = "typed-fixture-module";
