import type * as TypeFest from "type-fest";
import type { IsEqual } from "type-fest";

const directEqualCheck: IsEqual<string, string> = true;
const directUnequalCheck: IsEqual<number, string> = false;
const namespaceEqualCheck: TypeFest.IsEqual<"a", "a"> = true;

Boolean(directEqualCheck);
Boolean(directUnequalCheck);
Boolean(namespaceEqualCheck);

export const __typedFixtureModule = "typed-fixture-module";
