type NamedNonEmptyTuple = readonly [first: number, ...rest: number[]];

type VerboseNonEmptyTuple = readonly [string, ...string[]];

declare const words: VerboseNonEmptyTuple;
declare const digits: NamedNonEmptyTuple;

const [headWord] = words;
const [headDigit] = digits;

export const __typedFixtureModule = String(headWord) + String(headDigit);
