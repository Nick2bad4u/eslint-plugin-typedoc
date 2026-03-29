import type * as Aliases from "type-aliases";

type EnvironmentTemplate = Record<"api" | "dashboard", string>;
type UsesNamespaceSchema = Aliases.RecordDeep<EnvironmentTemplate, string>;

declare const usesNamespaceSchema: UsesNamespaceSchema;

String(usesNamespaceSchema);

export const __typedFixtureModule = "typed-fixture-module";
