import type { LiteralUnion } from "type-fest";

type EnvironmentName = LiteralUnion<"dev" | "prod", string>;
type HttpStatusCode = LiteralUnion<200 | 404, number>;
type AccessMode = "read" | "write";
type OptionalEnvironment = "dev" | string | undefined;

const environment: EnvironmentName = "dev";
const statusCode: HttpStatusCode = 200;
const mode: AccessMode = "read";
const optionalEnvironment: OptionalEnvironment = undefined;

String(environment);
String(statusCode);
String(mode);
String(optionalEnvironment);

export const __typedFixtureModule = "typed-fixture-module";
