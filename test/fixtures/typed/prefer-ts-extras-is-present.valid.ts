import { isPresent } from "ts-extras";

const maybeValue: null | string | undefined =
    Math.random() > 0.5 ? "ready" : null;

if (isPresent(maybeValue)) {
    maybeValue.toUpperCase();
}

if (maybeValue !== null) {
    String(maybeValue);
}

const values = [
    "alpha",
    null,
    "omega",
    undefined,
];
const presentValues = values.filter((value) => value != null);

String(presentValues.length);

export const __typedFixtureModule = "typed-fixture-module";
