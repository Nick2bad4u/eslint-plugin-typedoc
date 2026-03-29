/**
 * @packageDocumentation
 * Focused option coverage for the custom rule-doc remark lint plugin.
 */
import { remark } from "remark";
import { VFile } from "vfile";
import { describe, expect, it } from "vitest";

import remarkLintRuleDocHeadings from "../scripts/remark-lint-rule-doc-headings.mjs";

const validRuleDocMarkdown = `# prefer-demo

Short rule description.

## Targeted pattern scope

Describe the narrow pattern.

## What this rule reports

Describe the reported pattern.

## Why this rule exists

Explain the rationale.

## ❌ Incorrect

\`\`\`ts
demoBad();
\`\`\`

## ✅ Correct

\`\`\`ts
demoGood();
\`\`\`

## Further reading

- [Example](https://example.com)
`;

type RunLintOptions = Parameters<typeof remarkLintRuleDocHeadings>[0];

/**
 * Run the custom remark rule-doc headings plugin against markdown content.
 *
 * @param markdown - Markdown content to lint.
 * @param options - Plugin options under test.
 *
 * @returns Collected message reasons.
 */
const getLintMessageReasons = (
    markdown: string,
    options: Readonly<RunLintOptions>
): readonly string[] => {
    const file = new VFile({
        path: "docs/rules/prefer-demo.md",
        value: markdown,
    });
    const tree = remark().parse(file);
    const transformer = remarkLintRuleDocHeadings(options);

    transformer(tree, file);

    return file.messages.map(({ reason }) => reason);
};

describe("remark-lint-rule-doc-headings", () => {
    it("does not require a rule catalog id when the option is disabled", () => {
        const messageReasons = getLintMessageReasons(validRuleDocMarkdown, {
            requireRuleCatalogId: false,
        });

        expect(messageReasons).not.toContain(
            "Missing required rule catalog marker line `> **Rule catalog ID:** R###`."
        );
    });

    it("requires a rule catalog id when the option is enabled", () => {
        const messageReasons = getLintMessageReasons(validRuleDocMarkdown, {
            requireRuleCatalogId: true,
        });

        expect(messageReasons).toContain(
            "Missing required rule catalog marker line `> **Rule catalog ID:** R###`."
        );
    });
});
