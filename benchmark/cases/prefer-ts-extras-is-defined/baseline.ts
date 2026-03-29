const values = Array.from({ length: 100 }, (_, index) =>
    index % 3 === 0 ? undefined : index
);

const countDefinedValues = () => {
    let count = 0;

    for (const value of values) {
        if (value !== undefined) {
            count += value;
        }

        if (undefined !== value) {
            count += 1;
        }
    }

    return count;
};

const countMissingValues = () => {
    let count = 0;

    for (const value of values) {
        if (value === undefined) {
            count += 1;
        }

        if (undefined === value) {
            count += 1;
        }
    }

    return count;
};

const sumDefined = values
    .map((value) => (value !== undefined ? value : 0))
    .reduce((sum, value) => sum + value, 0);
