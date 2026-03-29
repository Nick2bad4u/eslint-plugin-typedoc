import type { createTypedRule as createTypedRuleType } from "../../src/_internal/typed-rule.js";

export type CreateTypedRuleSelectorAwarePassThrough =
    typeof createTypedRuleType;

declare module "vitest" {
    interface VitestUtils {
        /**
         * Support test harness patterns using `vi.doMock(import(...), factory)`
         * with intentionally partial module mocks.
         */
        // eslint-disable-next-line @typescript-eslint/method-signature-style -- interface augmentation overloads must use method signatures for VitestUtils merging.
        doMock(
            module: Promise<unknown>,
            factory?:
                | ((...arguments_: readonly unknown[]) => unknown)
                | Readonly<Record<string, unknown>>
        ): void;
    }
}

declare global {
    const createTypedRuleSelectorAwarePassThrough: CreateTypedRuleSelectorAwarePassThrough;
}
