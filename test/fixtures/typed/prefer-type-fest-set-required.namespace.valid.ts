import type * as Aliases from "type-aliases";

type DeploymentByNamespaceAlias = Aliases.RequiredBy<
    DeploymentPayload,
    "region"
>;

interface DeploymentPayload {
    environment: string;
    region?: string;
}

declare const deploymentByNamespaceAlias: DeploymentByNamespaceAlias;

String(deploymentByNamespaceAlias);

export const __typedFixtureModule = "typed-fixture-module";
