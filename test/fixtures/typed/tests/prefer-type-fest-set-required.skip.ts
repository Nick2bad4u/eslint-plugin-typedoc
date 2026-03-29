import type { RequiredBy } from "type-aliases";

interface DeploymentPayload {
    environment: string;
    region?: string;
}

type DeploymentShouldSkip = RequiredBy<DeploymentPayload, "region">;

declare const deploymentShouldSkip: DeploymentShouldSkip;

String(deploymentShouldSkip);

export const __typedFixtureModule = "typed-fixture-module";
