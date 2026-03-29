import type { NonEmptyTuple } from "type-fest";

type NotNonEmptyTuple = readonly [string, ...number[]];

type Words = NonEmptyTuple<string>;

declare const words: Words;
declare const values: NotNonEmptyTuple;

const [headWord] = words;
const [headValue] = values;

export const __typedFixtureModule = String(headWord) + String(headValue);
