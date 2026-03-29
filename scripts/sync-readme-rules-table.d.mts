export function syncReadmeRulesTable(input: {
    readonly writeChanges: boolean;
}): Promise<{
    readonly changed: boolean;
}>;
