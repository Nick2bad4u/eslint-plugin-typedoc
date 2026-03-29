import { objectEntries, objectFromEntries, objectMapValues } from "ts-extras";

const monitorStatusById = {
    alpha: "up",
    beta: "down",
} as const;

const mappedLabels = objectFromEntries(
    objectEntries(monitorStatusById).map(([key, value]) => [
        key,
        `${key}:${value}`,
    ])
);

const mappedStates = objectFromEntries(
    objectEntries(monitorStatusById).map(([key, value]) => {
        return [key, value.toUpperCase()];
    })
);

const mappedObjects = objectFromEntries(
    objectEntries(monitorStatusById).map(([key, value]) => [
        key,
        { key, value },
    ])
);

const alreadyPreferred = objectMapValues(
    monitorStatusById,
    (value, key) => `${key}:${value}`
);

String(mappedLabels);
String(mappedStates);
String(mappedObjects);
String(alreadyPreferred);

export const typedFixtureModule = "typed-fixture-module";
