import { themes as prismThemes } from "prism-react-renderer";
import type { Options as DocsPluginOptions } from "@docusaurus/plugin-content-docs";
import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";

const organizationName = "Nick2bad4u";
const projectName = "eslint-plugin-typedoc";
const siteUrl = "https://nick2bad4u.github.io";
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
    onBrokenAnchors: "warn",
    onBrokenLinks: "warn",
    onBrokenMarkdownLinks: "warn",
    organizationName,
    plugins: [
        [
            "@docusaurus/plugin-content-docs",
            {
                editUrl: `https://github.com/${organizationName}/${projectName}/tree/main/docs/rules/`,
                id: "rules",
                path: "../rules",
                routeBasePath: "docs/rules",
                sidebarPath: "./sidebars.rules.ts",
            } satisfies DocsPluginOptions,
        ],
    ],
    presets: [
        [
            "classic",
            {
                blog: false,
                docs: {
                    editUrl: `https://github.com/${organizationName}/${projectName}/tree/main/docs/docusaurus/`,
                    path: "site-docs",
                    routeBasePath: "docs",
                    sidebarPath: "./sidebars.ts",
                },
                theme: {
                    customCss: "./src/css/custom.css",
                },
            } satisfies Preset.Options,
        ],
    ],
    projectName,
    tagline: "TypeDoc validation and autofixing rules for ESLint.",
    themes: ["@docusaurus/theme-mermaid"],
    themeConfig: {
        footer: {
            copyright: `Copyright © ${new Date().getFullYear()} Nick2bad4u`,
            links: [
                {
                    items: [
                        {
                            label: "Rule docs",
                            to: "/docs/rules/overview",
                        },
                        {
                            label: "Getting started",
                            to: "/docs/getting-started",
                        },
                    ],
                    title: "Documentation",
                },
                {
                    items: [
                        {
                            href: `https://github.com/${organizationName}/${projectName}`,
                            label: "GitHub",
                        },
                        {
                            href: `https://www.npmjs.com/package/${projectName}`,
                            label: "npm",
                        },
                    ],
                    title: "Community",
                },
            ],
            style: "dark",
        },
        image: `${siteUrl}/${projectName}/img/logo.svg`,
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
                    href: `https://github.com/${organizationName}/${projectName}`,
                    label: "GitHub",
                    position: "right",
                },
            ],
            logo: {
                alt: "eslint-plugin-typedoc logo",
                src: "img/logo.svg",
            },
            title: "eslint-plugin-typedoc",
        },
        prism: {
            darkTheme: prismThemes.dracula,
            theme: prismThemes.github,
        },
    } satisfies Preset.ThemeConfig,
    title: "eslint-plugin-typedoc",
    trailingSlash: false,
    url: siteUrl,
};

export default config;
