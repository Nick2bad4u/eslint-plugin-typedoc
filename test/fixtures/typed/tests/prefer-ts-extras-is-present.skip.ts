const maybeValue: null | string | undefined =
    Math.random() > 0.5 ? "ready" : null;

if (maybeValue != null) {
    maybeValue.toUpperCase();
}

export const __typedFixtureModule = "typed-fixture-module";
