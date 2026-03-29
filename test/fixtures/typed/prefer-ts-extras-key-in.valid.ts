interface MonitorPayload {
    readonly id: string;
    readonly status: "down" | "up";
}

declare function keyIn<TObject extends object>(
    object: TObject,
    key: PropertyKey
): key is keyof TObject;

const monitorPayload: MonitorPayload = {
    id: "monitor-1",
    status: "up",
};

declare const dynamicKey: string;

if (keyIn(monitorPayload, dynamicKey)) {
    const value = monitorPayload[dynamicKey];
    if (typeof value === "number") {
        throw new TypeError("Unexpected numeric payload value");
    }
}

export const typedFixtureModule = "typed-fixture-module";
