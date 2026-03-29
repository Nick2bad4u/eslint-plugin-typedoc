import type { RequiredBy } from "type-aliases";

type DeploymentByAlias = RequiredBy<DeploymentPayload, "region">;

interface DeploymentPayload {
    environment: string;
    region?: string;
}

declare const deploymentByAlias: DeploymentByAlias;

String(deploymentByAlias);

export const __typedFixtureModule = "typed-fixture-module";
