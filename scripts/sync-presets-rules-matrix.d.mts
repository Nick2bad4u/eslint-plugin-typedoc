export interface PresetsRuleModule {
    readonly meta?:
        | {
              readonly docs?:
                  | {
                        readonly typedocConfigs?:
                            readonly string[] | string | undefined;
                        readonly url?: string | undefined;
                    }
                  | undefined;
              readonly fixable?: string | undefined;
              readonly hasSuggestions?: boolean | undefined;
          }
        | undefined;
}

export function generatePresetsRulesMatrixSectionFromRules(
    rules: Readonly<Record<string, PresetsRuleModule>>
): string;

export function syncPresetsRulesMatrix(input: {
    readonly writeChanges: boolean;
}): Promise<Readonly<{ changed: boolean; changedPaths: readonly string[] }>>;
