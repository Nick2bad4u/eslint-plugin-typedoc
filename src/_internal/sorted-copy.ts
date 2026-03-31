/**
 * @packageDocumentation
 * Small immutable sorting helpers for internal metadata and rule messages.
 */

/** Create a sorted copy of iterable values without mutating the input. */
export const createSortedCopy = <T>(
    values: Iterable<T>,
    compare: (left: T, right: T) => number
): readonly T[] => {
    const sortedValues: T[] = [];

    for (const value of values) {
        let insertionIndex = 0;

        while (insertionIndex < sortedValues.length) {
            const existingValue = sortedValues[insertionIndex];

            if (
                existingValue !== undefined &&
                compare(existingValue, value) > 0
            ) {
                break;
            }

            insertionIndex += 1;
        }

        sortedValues.splice(insertionIndex, 0, value);
    }

    return sortedValues;
};

/** Create a locale-sorted copy of string values without mutating the input. */
export const createLocaleSortedStringCopy = (
    values: Iterable<string>
): readonly string[] =>
    createSortedCopy(values, (left, right) => left.localeCompare(right));

export default createSortedCopy;
