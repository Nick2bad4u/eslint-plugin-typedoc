import { isDefined } from "ts-extras";

const maybeValue: string | undefined =
    Math.random() > 0.5 ? "ready" : undefined;

if (isDefined(maybeValue)) {
    maybeValue.toUpperCase();
}

if (maybeValue !== null) {
    String(maybeValue);
}

const values = [
    "alpha",
    undefined,
    "omega",
];
const presentValues = values.filter((value) => value !== undefined);

String(presentValues.length);

export const __typedFixtureModule = "typed-fixture-module";
