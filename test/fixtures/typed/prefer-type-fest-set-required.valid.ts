import type { SetRequired } from "type-fest";

interface DeploymentPayload {
    environment: string;
    region?: string;
}

type DeploymentWithRegion = SetRequired<DeploymentPayload, "region">;

declare const deploymentWithRegion: DeploymentWithRegion;

String(deploymentWithRegion);

export const __typedFixtureModule = "typed-fixture-module";
