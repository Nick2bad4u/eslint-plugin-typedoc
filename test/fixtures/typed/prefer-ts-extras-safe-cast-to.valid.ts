import { safeCastTo } from "ts-extras";

declare const unknownValue: unknown;

const forcedValue = unknownValue as string;
const helperValue = safeCastTo<string>("Alice");
const literalValue = "Alice" as const;

String(forcedValue);
String(helperValue);
String(literalValue);

export const __typedFixtureModule = "typed-fixture-module";
