import { themes as prismThemes } from "prism-react-renderer";

import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";

const siteOrigin = "https://nick2bad4u.github.io";
const projectName = "eslint-plugin-typedoc";
const baseUrl = process.env["DOCUSAURUS_BASE_URL"] ?? `/${projectName}/`;

const config: Config = {
    baseUrl,
    favicon: "img/logo.svg",
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
                id: "docs",
                path: "site-docs",
                routeBasePath: "docs",
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
                pages: {},
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
                            label: "Intro",
                            to: "/docs/intro",
                        },
                        {
                            label: "Rule overview",
                            to: "/docs/rules/overview",
                        },
                        {
                            label: "Presets",
                            to: "/docs/rules/presets",
                        },
                    ],
                    title: "Docs",
                },
                {
                    items: [
                        {
                            href: `https://github.com/Nick2bad4u/${projectName}`,
                            label: "GitHub",
                        },
                        {
                            href: `https://www.npmjs.com/package/${projectName}`,
                            label: "npm",
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
                    label: "Docs",
                    position: "left",
                    to: "/docs/intro",
                },
                {
                    label: "Rules",
                    position: "left",
                    to: "/docs/rules/overview",
                },
                {
                    href: `https://github.com/Nick2bad4u/${projectName}`,
                    label: "GitHub",
                    position: "right",
                },
            ],
            logo: {
                alt: "eslint-plugin-typedoc logo",
                src: "img/logo.svg",
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
