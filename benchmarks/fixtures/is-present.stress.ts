type MaybeText = null | string | undefined;

let consumedUpperCaseLength = 0;

const values: readonly MaybeText[] = [
    "alpha",
    null,
    "bravo",
    undefined,
    "charlie",
    null,
    "delta",
    undefined,
    "echo",
    null,
    "foxtrot",
    undefined,
];

const consume = (value: MaybeText): void => {
    if (typeof value === "string") {
        const upperCasedValue = value.toUpperCase();
        consumedUpperCaseLength += upperCasedValue.length;
    }
};

const candidate0 = values[0];
const candidate1 = values[1];
const candidate2 = values[2];
const candidate3 = values[3];
const candidate4 = values[4];
const candidate5 = values[5];

if (candidate0 !== null && candidate0 !== undefined) {
    consume(candidate0);
}
if (candidate0 !== null && candidate0 !== undefined) {
    consume(candidate0);
}
if (candidate1 === null || candidate1 === undefined) {
    consume(candidate1);
}
if (candidate1 !== null && candidate1 !== undefined) {
    consume(candidate1);
}
if (candidate2 !== undefined && candidate2 !== null) {
    consume(candidate2);
}
if (candidate2 === null || candidate2 === undefined) {
    consume(candidate2);
}

if (candidate3 !== null && candidate3 !== undefined) {
    consume(candidate3);
}
if (candidate3 !== null && candidate3 !== undefined) {
    consume(candidate3);
}
if (candidate4 === null || candidate4 === undefined) {
    consume(candidate4);
}
if (candidate4 !== null && candidate4 !== undefined) {
    consume(candidate4);
}
if (candidate5 !== undefined && candidate5 !== null) {
    consume(candidate5);
}
if (candidate5 === null || candidate5 === undefined) {
    consume(candidate5);
}

export const isPresentStressFixture: number =
    values.length + consumedUpperCaseLength;
