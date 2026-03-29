import { isEqualType } from "ts-extras";
import type { IsEqual } from "type-fest";

const equalTypeCheck = isEqualType<string, string>();
const unequalTypeCheck = isEqualType<number, string>();

type StringNumberEqual = IsEqual<string, number>;

declare const maybeFlag: StringNumberEqual;

Boolean(equalTypeCheck);
Boolean(unequalTypeCheck);
Boolean(maybeFlag);

export const __typedFixtureModule = "typed-fixture-module";
