import { objectEntries, objectFromEntries, objectMapValues } from "ts-extras";

const monitorStatusById = {
    alpha: "up",
    beta: "down",
} as const;

const mappedValues = objectMapValues(
    monitorStatusById,
    (value, key) => `${key}:${value}`
);

const renamedKeys = objectFromEntries(
    objectEntries(monitorStatusById).map(([key, value]) => [
        `monitor-${key}`,
        value,
    ])
);

const nativeMappedValues = Object.fromEntries(
    Object.entries(monitorStatusById).map(([key, value]) => [
        key,
        `${key}:${value}`,
    ])
);

const functionExpressionMappedValues = objectFromEntries(
    objectEntries(monitorStatusById).map(function ([key, value]) {
        return [key, `${key}:${value}`];
    })
);

const mapThisArgument = { prefix: "service" };

const mapWithThisArgument = objectFromEntries(
    objectEntries(monitorStatusById).map(
        ([key, value]) => [key, `${key}:${value}`],
        mapThisArgument
    )
);

String(mappedValues);
String(renamedKeys);
String(nativeMappedValues);
String(functionExpressionMappedValues);
String(mapWithThisArgument);

export const typedFixtureModule = "typed-fixture-module";
