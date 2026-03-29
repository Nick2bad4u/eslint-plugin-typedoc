import type { Schema } from "type-fest";

type EnvironmentConfig = Schema<EnvironmentTemplate, string>;
type EnvironmentTemplate = Record<"api" | "dashboard", string>;

declare const environmentConfig: EnvironmentConfig;

String(environmentConfig);

export const __typedFixtureModule = "typed-fixture-module";
