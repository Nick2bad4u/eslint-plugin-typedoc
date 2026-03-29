const maybeValue: string | undefined =
    Math.random() > 0.5 ? "ready" : undefined;

if (maybeValue !== undefined) {
    maybeValue.toUpperCase();
}

export const __typedFixtureModule = "typed-fixture-module";
