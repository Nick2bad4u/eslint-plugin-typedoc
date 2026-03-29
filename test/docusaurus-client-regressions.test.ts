import * as fs from "node:fs";
import { createRequire } from "node:module";
import * as path from "node:path";
import { describe, expect, it, vi } from "vitest";

type PrismLanguageGrammar = Record<string, unknown>;
type PrismLike = Readonly<{
    highlight: (
        text: string,
        grammar: Readonly<PrismLanguageGrammar>,
        language: string
    ) => string;
    languages: Readonly<Record<string, PrismLanguageGrammar | undefined>> & {
        extend: (
            id: string,
            redef: Readonly<PrismLanguageGrammar>
        ) => PrismLanguageGrammar;
    };
}>;

const requireFromDocsWorkspace = createRequire(import.meta.url);
const prismIncludeLanguages = requireFromDocsWorkspace(
    "../docs/docusaurus/src/theme/prism-include-languages.js"
) as (prismObject: PrismLike) => PrismLike;
const Prism = requireFromDocsWorkspace("prismjs") as PrismLike;

requireFromDocsWorkspace("prismjs/components/prism-javascript");
requireFromDocsWorkspace("prismjs/components/prism-jsx");
requireFromDocsWorkspace("prismjs/components/prism-typescript");
requireFromDocsWorkspace("prismjs/components/prism-tsx");

type GlobalTestEnvironment = typeof globalThis & {
    document?: Document;
    location?: Location;
    MutationObserver?: typeof MutationObserver;
    window?: typeof globalThis & Window;
};

const globalTestEnvironment = globalThis as GlobalTestEnvironment;
const originalDocument = globalTestEnvironment.document;
const originalLocation = globalTestEnvironment.location;
const originalMutationObserver = globalTestEnvironment.MutationObserver;
const originalWindow = globalTestEnvironment.window;
const modernEnhancementsPath = path.join(
    process.cwd(),
    "docs/docusaurus/src/js/modernEnhancements.ts"
);

const restoreGlobalTestEnvironment = (): void => {
    globalTestEnvironment.document = originalDocument;
    globalTestEnvironment.location = originalLocation;
    globalTestEnvironment.MutationObserver = originalMutationObserver;
    globalTestEnvironment.window = originalWindow;
    vi.restoreAllMocks();
};

describe("docusaurus client regressions", () => {
    describe("prism customization", () => {
        it("highlights JSDoc tags inside TypeScript doc-comment blocks", () => {
            try {
                prismIncludeLanguages(Prism);
                const fallbackGrammar = Prism.languages.extend("clike", {});
                const typescriptGrammar = Prism.languages["typescript"];

                expect(typescriptGrammar).toBeDefined();

                const highlighted = Prism.highlight(
                    [
                        "/**",
                        " * @example",
                        " * @category Type guard",
                        " */",
                    ].join("\n"),
                    typescriptGrammar ?? fallbackGrammar,
                    "typescript"
                );

                expect(highlighted).toContain("token jsdoc-tag keyword");
                expect(highlighted).toContain("@example");
                expect(highlighted).toContain("@category");
            } finally {
                restoreGlobalTestEnvironment();
            }
        });
    });

    describe("client enhancement bootstrap", () => {
        it("uses the window load event instead of DOMContentLoaded for initial setup", () => {
            try {
                const sourceText = fs.readFileSync(
                    modernEnhancementsPath,
                    "utf8"
                );

                expect(sourceText).toContain(
                    'window.addEventListener("load", handleWindowLoad, { once: true });'
                );
                expect(sourceText).not.toContain(
                    'document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);'
                );
                expect(sourceText).toContain(
                    'if (document.readyState === "complete") {'
                );
            } finally {
                restoreGlobalTestEnvironment();
            }
        });
    });
});
