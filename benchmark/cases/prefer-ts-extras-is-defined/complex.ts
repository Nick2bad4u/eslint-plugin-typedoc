const input = [
    "alpha",
    undefined,
    "beta",
    undefined,
    "charlie",
    "delta",
    undefined,
];

const readValue = (value = input[0]) => {
    if (typeof value !== "undefined") {
        return `${value}-ok`;
    }

    if ("undefined" !== typeof value) {
        return `${value}-ok-2`;
    }

    if (typeof value === "undefined") {
        return "missing";
    }

    if ("undefined" === typeof value) {
        return "missing-2";
    }

    return "fallback";
};

const allValues = input
    .map((value) => readValue(value))
    .filter((value) => value !== undefined)
    .filter((value) => value === undefined || value.length > 0)
    .map((value) => `${value}!`);

const definedValues = input.filter((value) => value !== undefined);

let missingCount = 0;

for (const value of input) {
    if (value === undefined) {
        missingCount += 1;
    }
}

const grouped = {
    defined: definedValues,
    missing: missingCount,
};
