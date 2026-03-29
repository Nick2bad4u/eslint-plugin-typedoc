type EnvironmentName = "dev" | "prod" | string;
type HttpStatusCode = 200 | 404 | number;

const environment: EnvironmentName = "dev";
const statusCode: HttpStatusCode = 200;

String(environment);
String(statusCode);

export const __typedFixtureModule = "typed-fixture-module";
