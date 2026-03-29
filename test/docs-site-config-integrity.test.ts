import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const chartIndexBulletPattern =
    /^- \[[^\n\r]+\]\(\.\/(?<chartFile>[^\n\r]+\.md)\)$/v;

const readWorkspaceFile = (relativePath: string): string =>
    fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("docusaurus site configuration integrity", () => {
    it("uses canonical blob editUrl bases for rules/docs/blog/pages", () => {
        const docusaurusConfigSource = readWorkspaceFile(
            "docs/docusaurus/docusaurus.config.ts"
        );

        expect(docusaurusConfigSource).toMatch(
            /editUrl:\s*`https:\/\/github\.com\/\$\{organizationName\}\/\$\{projectName\}\/blob\/main\/docs\/`/v
        );

        expect(docusaurusConfigSource).toMatch(
            /editUrl:\s*`https:\/\/github\.com\/\$\{organizationName\}\/\$\{projectName\}\/blob\/main\/docs\/docusaurus\/`/v
        );

        expect(docusaurusConfigSource).not.toContain("/tree/");
        expect(docusaurusConfigSource).not.toContain("/blog/blog/");
    });

    it("charts index uses linked chart entries with existing local files", () => {
        const chartsIndexRelativePath =
            "docs/docusaurus/site-docs/developer/charts/index.md";
        const chartsIndexSource = readWorkspaceFile(chartsIndexRelativePath);

        const sectionHeader = "## Chart set";
        const sectionStart = chartsIndexSource.indexOf(sectionHeader);

        expect(sectionStart).toBeGreaterThanOrEqual(0);

        const sectionBody = chartsIndexSource
            .slice(sectionStart + sectionHeader.length)
            .trim();

        const bulletLines = sectionBody
            .split(/\r?\n/v)
            .map((line) => line.trim())
            .filter((line) => line.startsWith("- "));

        expect(bulletLines.length).toBeGreaterThan(0);

        for (const bulletLine of bulletLines) {
            expect(bulletLine).toMatch(chartIndexBulletPattern);

            const linkMatch = chartIndexBulletPattern.exec(bulletLine);
            const chartFile = linkMatch?.groups?.["chartFile"];

            expect(chartFile).toBeDefined();

            const resolvedTargetPath = path.resolve(
                process.cwd(),
                "docs/docusaurus/site-docs/developer/charts",
                chartFile ?? ""
            );

            expect(fs.existsSync(resolvedTargetPath)).toBeTruthy();
        }
    });
});
