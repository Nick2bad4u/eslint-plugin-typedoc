import type { RecordDeep } from "type-aliases";

type EnvironmentConfig = RecordDeep<EnvironmentTemplate, string>;
type EnvironmentTemplate = Record<"api" | "dashboard", string>;

declare const environmentConfig: EnvironmentConfig;

String(environmentConfig);

export const __typedFixtureModule = "typed-fixture-module";
