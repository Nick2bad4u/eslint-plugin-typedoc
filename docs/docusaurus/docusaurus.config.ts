import { themes as prismThemes } from "prism-react-renderer";

import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";

const siteOrigin = "https://nick2bad4u.github.io";
const projectName = "eslint-plugin-typedoc";
const baseUrl = process.env["DOCUSAURUS_BASE_URL"] ?? `/${projectName}/`;

const config: Config = {
    baseUrl,
    favicon: "img/favicon.ico",
    i18n: {
        defaultLocale: "en",
        locales: ["en"],
    },
    markdown: {
        mermaid: true,
    },
    onBrokenLinks: "warn",
    onBrokenMarkdownLinks: "warn",
    organizationName: "Nick2bad4u",
    plugins: [
        [
            "@docusaurus/plugin-content-docs",
            {
                editUrl:
                    "https://github.com/Nick2bad4u/eslint-plugin-typedoc/tree/main/docs/docusaurus/",
                id: "developer",
                path: "site-docs",
                routeBasePath: "docs/developer",
                sidebarPath: "./sidebars.ts",
            },
        ],
        [
            "@docusaurus/plugin-content-docs",
            {
                editUrl:
                    "https://github.com/Nick2bad4u/eslint-plugin-typedoc/tree/main/docs/rules/",
                id: "rules",
                path: "../rules",
                routeBasePath: "docs/rules",
                sidebarPath: "./sidebars.rules.ts",
            },
        ],
        "docusaurus-plugin-image-zoom",
    ],
    presets: [
        [
            "classic",
            {
                blog: false,
                docs: false,
                pages: {
                    exclude: ["**/*.d.ts"],
                },
                theme: {
                    customCss: "./src/css/custom.css",
                },
            } satisfies Preset.Options,
        ],
    ],
    projectName,
    tagline:
        "TypeDoc validation, reporting, and autofix workflows integrated into ESLint.",
    themeConfig: {
        colorMode: {
            respectPrefersColorScheme: true,
        },
        footer: {
            copyright: `© ${new Date().getFullYear()} Nick2bad4u. Built with Docusaurus.`,
            links: [
                {
                    items: [
                        {
                            label: "Rules overview",
                            to: "/docs/rules/overview",
                        },
                        {
                            label: "Rules getting started",
                            to: "/docs/rules/getting-started",
                        },
                        {
                            label: "Presets",
                            to: "/docs/rules/presets",
                        },
                        {
                            label: "Rule catalog",
                            to: "/docs/rules/overview#available-rules",
                        },
                    ],
                    title: "Rules",
                },
                {
                    items: [
                        {
                            label: "Developer overview",
                            to: "/docs/developer/intro",
                        },
                        {
                            label: "TypeDoc pipeline",
                            to: "/docs/developer/typedoc-pipeline",
                        },
                        {
                            href: "/eslint-inspector/",
                            label: "ESLint Inspector",
                        },
                        {
                            href: "/stylelint-inspector/",
                            label: "Stylelint Inspector",
                        },
                    ],
                    title: "Developer",
                },
                {
                    items: [
                        {
                            href: `https://github.com/Nick2bad4u/${projectName}`,
                            label: "Repository",
                        },
                        {
                            href: `https://www.npmjs.com/package/${projectName}`,
                            label: "npm",
                        },
                        {
                            href: `https://github.com/Nick2bad4u/${projectName}/releases`,
                            label: "Releases",
                        },
                        {
                            href: `https://github.com/Nick2bad4u/${projectName}/issues`,
                            label: "Issues",
                        },
                    ],
                    title: "Project",
                },
            ],
            style: "dark",
        },
        image: "img/logo.png",
        metadata: [
            {
                content:
                    "eslint-plugin-typedoc, typedoc, eslint, typescript, documentation linting",
                name: "keywords",
            },
        ],
        navbar: {
            items: [
                {
                    label: "Rules",
                    position: "left",
                    to: "/docs/rules/overview",
                },
                {
                    label: "Developer",
                    position: "left",
                    to: "/docs/developer/intro",
                },
                {
                    items: [
                        {
                            label: "ESLint Inspector",
                            to: "/eslint-inspector/",
                        },
                        {
                            label: "Stylelint Inspector",
                            to: "/stylelint-inspector/",
                        },
                    ],
                    label: "Inspectors",
                    position: "left",
                },
                {
                    href: `https://github.com/Nick2bad4u/${projectName}`,
                    label: "GitHub",
                    position: "right",
                },
            ],
            logo: {
                alt: "eslint-plugin-typedoc logo",
                src: "img/typedoc-logo-mark.png",
            },
            title: projectName,
        },
        prism: {
            darkTheme: prismThemes.dracula,
            theme: prismThemes.github,
        },
        zoom: {
            selector: ".markdown :not(em) > img",
        },
    } satisfies Preset.ThemeConfig,
    title: projectName,
    url: siteOrigin,
};

export default config;
