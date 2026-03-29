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

const values = Object.values(monitorStatusById);
const secondValues = Object.values(monitorStatusById);
const typedValues = objectValues(monitorStatusById);

if (values.length + secondValues.length + typedValues.length > 10) {
    throw new TypeError("Unexpected values count");
}

export const typedFixtureModule = "typed-fixture-module";
