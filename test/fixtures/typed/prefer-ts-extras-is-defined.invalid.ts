const maybeValue: string | undefined =
    Math.random() > 0.5 ? "ready" : undefined;

if (maybeValue !== undefined) {
    maybeValue.toUpperCase();
}

if (undefined !== maybeValue) {
    maybeValue.toUpperCase();
}

if (typeof maybeValue !== "undefined") {
    maybeValue.toUpperCase();
}

if (maybeValue === undefined) {
    String(maybeValue);
}

if ("undefined" === typeof maybeValue) {
    String(maybeValue);
}

export const __typedFixtureModule = "typed-fixture-module";
