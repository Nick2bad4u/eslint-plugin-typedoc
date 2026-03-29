export function syncPresetRuleDocs(input: {
    readonly writeChanges: boolean;
}): Promise<{
    readonly changedFiles: readonly string[];
}>;
