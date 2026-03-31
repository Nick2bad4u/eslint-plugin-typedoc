import { themes as prismThemes } from "prism-react-renderer";

import type { Options as DocsPluginOptions } from "@docusaurus/plugin-content-docs";
import type * as Preset from "@docusaurus/preset-classic";
import type { Config, PluginModule } from "@docusaurus/types";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const siteOrigin = "https://nick2bad4u.github.io";
const projectName = "eslint-plugin-typedoc";
const organizationName = "Nick2bad4u";
const baseUrl = process.env["DOCUSAURUS_BASE_URL"] ?? `/${projectName}/`;
const enableExperimentalFaster =
    process.env["DOCUSAURUS_ENABLE_EXPERIMENTAL"] === "true";
const siteUrl = `${siteOrigin}${baseUrl}`;
const siteDescription =
    "ESLint rules for TypeDoc documentation quality, validation, reporting, and autofix workflows.";
const socialCardImagePath = "img/logo_512x512.png";
const socialCardImageUrl = new URL(socialCardImagePath, siteUrl).toString();
const modernEnhancementsClientModule = fileURLToPath(
    new URL("src/js/modernEnhancements.ts", import.meta.url)
);
const pwaThemeColor = "#2B134E";
const pwaTileColor = "#2B134E";
const pwaMaskIconColor = "#A855F7";
const footerCopyright =
    `© ${new Date().getFullYear()} ` +
    '<a href="https://github.com/Nick2bad4u/" target="_blank" rel="noopener noreferrer">Nick2bad4u</a> 💻 Built with ' +
    '<a href="https://docusaurus.io/" target="_blank" rel="noopener noreferrer">🦖 Docusaurus</a>.';
const removeHeadAttrFlagKey = [
    "remove",
    "Le",
    "gacyPostBuildHeadAttribute",
].join("");

const requireFromDocsWorkspace = createRequire(import.meta.url);

const resolveOptionalModule = (moduleSpecifier: string): string | undefined => {
    try {
        return requireFromDocsWorkspace.resolve(moduleSpecifier);
    } catch {
        return undefined;
    }
};

const vscodeCssLanguageServiceEsmEntry = resolveOptionalModule(
    "vscode-css-languageservice/lib/esm/cssLanguageService.js"
);
const vscodeLanguageServerTypesEsmEntry = resolveOptionalModule(
    "vscode-languageserver-types/lib/esm/main.js"
);

const suppressKnownWebpackWarningsPlugin: PluginModule = () => {
    if (
        vscodeCssLanguageServiceEsmEntry === undefined ||
        vscodeLanguageServerTypesEsmEntry === undefined
    ) {
        return null;
    }

    return {
        configureWebpack() {
            return {
                ignoreWarnings: [
                    {
                        message:
                            /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/u,
                        module: /vscode-languageserver-types[\\/]lib[\\/]umd[\\/]main\.js/u,
                    },
                ],
                resolve: {
                    alias: {
                        "vscode-css-languageservice$":
                            vscodeCssLanguageServiceEsmEntry,
                        "vscode-languageserver-types$":
                            vscodeLanguageServerTypesEsmEntry,
                        "vscode-languageserver-types/lib/umd/main.js$":
                            vscodeLanguageServerTypesEsmEntry,
                    },
                },
            };
        },
        name: "suppress-known-webpack-warnings",
    };
};

const futureConfig = {
    ...(enableExperimentalFaster
        ? {
              experimental_faster: {
                  mdxCrossCompilerCache: true,
                  rspackBundler: true,
                  rspackPersistentCache: true,
                  ssgWorkerThreads: true,
              },
          }
        : {}),
    v4: {
        [removeHeadAttrFlagKey]: true,
        useCssCascadeLayers: false,
    },
} satisfies Config["future"];

const config: Config = {
    baseUrl,
    baseUrlIssueBanner: true,
    clientModules: [modernEnhancementsClientModule],
    deploymentBranch: "gh-pages",
    favicon: "img/favicon.ico",
    future: futureConfig,
    headTags: [
        {
            attributes: {
                href: siteOrigin,
                rel: "preconnect",
            },
            tagName: "link",
        },
        {
            attributes: {
                href: "https://github.com",
                rel: "preconnect",
            },
            tagName: "link",
        },
        {
            attributes: {
                type: "application/ld+json",
            },
            innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                description: siteDescription,
                image: socialCardImageUrl,
                name: projectName,
                publisher: {
                    "@type": "Person",
                    name: "Nick2bad4u",
                    url: "https://github.com/Nick2bad4u",
                },
                url: siteUrl,
            }),
            tagName: "script",
        },
    ],
    i18n: {
        defaultLocale: "en",
        locales: ["en"],
    },
    markdown: {
        anchors: {
            maintainCase: true,
        },
        emoji: true,
        format: "detect",
        hooks: {
            onBrokenMarkdownImages: "warn",
            onBrokenMarkdownLinks: "warn",
        },
        mermaid: true,
    },
    noIndex: false,
    onBrokenAnchors: "warn",
    onBrokenLinks: "warn",
    onDuplicateRoutes: "warn",
    organizationName,
    plugins: [
        suppressKnownWebpackWarningsPlugin,
        "docusaurus-plugin-image-zoom",
        [
            "@docusaurus/plugin-pwa",
            {
                debug: process.env["DOCUSAURUS_PWA_DEBUG"] === "true",
                offlineModeActivationStrategies: [
                    "appInstalled",
                    "standalone",
                    "queryString",
                ],
                pwaHead: [
                    {
                        href: `${baseUrl}manifest.json`,
                        rel: "manifest",
                        tagName: "link",
                    },
                    {
                        content: pwaThemeColor,
                        name: "theme-color",
                        tagName: "meta",
                    },
                    {
                        content: "yes",
                        name: "apple-mobile-web-app-capable",
                        tagName: "meta",
                    },
                    {
                        content: "default",
                        name: "apple-mobile-web-app-status-bar-style",
                        tagName: "meta",
                    },
                    {
                        href: `${baseUrl}img/logo_192x192.png`,
                        rel: "apple-touch-icon",
                        tagName: "link",
                    },
                    {
                        color: pwaMaskIconColor,
                        href: `${baseUrl}img/logo.svg`,
                        rel: "mask-icon",
                        tagName: "link",
                    },
                    {
                        content: `${baseUrl}img/logo_192x192.png`,
                        name: "msapplication-TileImage",
                        tagName: "meta",
                    },
                    {
                        content: pwaTileColor,
                        name: "msapplication-TileColor",
                        tagName: "meta",
                    },
                ],
            },
        ],
        [
            "@docusaurus/plugin-content-docs",
            {
                editUrl: `https://github.com/${organizationName}/${projectName}/blob/main/docs/`,
                id: "rules",
                path: "../rules",
                routeBasePath: "docs/rules",
                showLastUpdateAuthor: true,
                showLastUpdateTime: true,
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
                    breadcrumbs: true,
                    editUrl: `https://github.com/${organizationName}/${projectName}/blob/main/docs/docusaurus/`,
                    includeCurrentVersion: true,
                    onInlineTags: "ignore",
                    path: "site-docs",
                    routeBasePath: "docs",
                    showLastUpdateAuthor: true,
                    showLastUpdateTime: true,
                    sidebarCollapsed: true,
                    sidebarCollapsible: true,
                    sidebarPath: "./sidebars.ts",
                },
                googleTagManager: {
                    containerId: "GTM-T8J6HPLF",
                },
                gtag: {
                    trackingID: "G-18DR1S6R1T",
                },
                pages: {
                    editUrl: `https://github.com/${organizationName}/${projectName}/blob/main/docs/docusaurus/`,
                    exclude: [
                        "**/*.d.ts",
                        "**/*.d.tsx",
                        "**/__tests__/**",
                        "**/*.test.{js,jsx,ts,tsx}",
                        "**/*.spec.{js,jsx,ts,tsx}",
                    ],
                    include: ["**/*.{js,jsx,ts,tsx,md,mdx}"],
                    mdxPageComponent: "@theme/MDXPage",
                    path: "src/pages",
                    routeBasePath: "/",
                    showLastUpdateAuthor: true,
                    showLastUpdateTime: true,
                },
                debug:
                    process.env["DOCUSAURUS_PRESET_CLASSIC_DEBUG"] === "true",
                sitemap: {
                    filename: "sitemap.xml",
                    ignorePatterns: ["/tests/**"],
                    lastmod: "datetime",
                },
                svgr: {
                    svgrConfig: {
                        dimensions: false,
                        expandProps: "start",
                        icon: true,
                        memo: true,
                        native: false,
                        prettier: true,
                        prettierConfig: "../../.prettierrc",
                        replaceAttrValues: {
                            "#000": "currentColor",
                            "#000000": "currentColor",
                        },
                        svgo: true,
                        svgoConfig: {
                            plugins: [{ active: false, name: "removeViewBox" }],
                        },
                        svgProps: { focusable: "false", role: "img" },
                        titleProp: true,
                        typescript: true,
                    },
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
            defaultMode: "dark",
            disableSwitch: false,
            respectPrefersColorScheme: true,
        },
        footer: {
            copyright: footerCopyright,
            links: [
                {
                    items: [
                        {
                            label: "🏁 Overview",
                            to: "/docs/rules/overview",
                        },
                        {
                            label: "🚀 Getting Started",
                            to: "/docs/rules/getting-started",
                        },
                        {
                            label: "🎛️ Presets",
                            to: "/docs/rules/presets",
                        },
                        {
                            label: "📏 Rule Reference",
                            to: "/docs/rules",
                        },
                    ],
                    title: "📚 Docs",
                },
                {
                    items: [
                        {
                            href: "https://typedoc.org/",
                            label: "📖 TypeDoc",
                        },
                        {
                            href: "https://eslint.org/",
                            label: "🔎 ESLint",
                        },
                        {
                            href: `${siteOrigin}/${projectName}/stylelint-inspector/`,
                            label: "🎨 Stylelint Inspector",
                        },
                        {
                            href: `${siteOrigin}/${projectName}/eslint-inspector/`,
                            label: "🔎 ESLint Inspector",
                        },
                    ],
                    title: "🧩 Dev",
                },
                {
                    items: [
                        {
                            href: `https://github.com/${organizationName}/${projectName}`,
                            label: "󰊤 GitHub Repository",
                        },
                        {
                            href: `https://github.com/${organizationName}/${projectName}/releases`,
                            label: "󰫑 Releases",
                        },
                        {
                            href: `https://github.com/${organizationName}/${projectName}/issues`,
                            label: "󰅙 Report Issues",
                        },
                        {
                            href: `https://www.npmjs.com/package/${projectName}`,
                            label: "󰏗 npm Package",
                        },
                    ],
                    title: "🤝 Project",
                },
            ],
            logo: {
                alt: "eslint-plugin-typedoc logo",
                height: 60,
                href: `https://github.com/${organizationName}/${projectName}`,
                src: "img/logo_60x60.png",
                width: 60,
            },
            style: "dark",
        },
        image: socialCardImagePath,
        metadata: [
            {
                content:
                    "eslint, eslint-plugin, typedoc, typescript, flat config, static analysis, docs",
                name: "keywords",
            },
            {
                content: "summary_large_image",
                name: "twitter:card",
            },
            {
                content: projectName,
                property: "og:site_name",
            },
            {
                content: socialCardImageUrl,
                property: "og:image",
            },
            {
                content: socialCardImageUrl,
                name: "twitter:image",
            },
        ],
        navbar: {
            hideOnScroll: true,
            items: [
                {
                    activeBaseRegex: "^/docs(?:/(?!rules(?:/|$)).*)?$",
                    items: [
                        {
                            label: "🏁 Overview",
                            to: "/docs/rules/overview",
                        },
                        {
                            label: "🚀 Getting Started",
                            to: "/docs/rules/getting-started",
                        },
                        {
                            label: "🎛️ Presets",
                            to: "/docs/rules/presets",
                        },
                        {
                            label: "📏 Rule Reference",
                            to: "/docs/rules",
                        },
                    ],
                    label: "📚 Docs",
                    position: "left",
                    to: "/docs/rules/overview",
                    type: "dropdown",
                },
                {
                    activeBaseRegex: "^/docs/rules(?:/(?!presets(?:/|$)).*)?$",
                    items: [
                        {
                            label: "🏁 Rules Overview",
                            to: "/docs/rules/overview",
                        },
                        {
                            label: "🎯 Rule Catalog",
                            to: "/docs/rules",
                        },
                    ],
                    label: "📜 Rules",
                    position: "left",
                    to: "/docs/rules/overview",
                    type: "dropdown",
                },
                {
                    activeBaseRegex: "^/docs/rules/presets(?:/.*)?$",
                    items: [
                        {
                            label: "🎛️ Preset Reference",
                            to: "/docs/rules/presets",
                        },
                        {
                            label: "🟢 Minimal",
                            to: "/docs/rules/presets/minimal",
                        },
                        {
                            label: "🔵 Recommended",
                            to: "/docs/rules/presets/recommended",
                        },
                        {
                            label: "📝 Markdown",
                            to: "/docs/rules/presets/markdown",
                        },
                        {
                            label: "🟠 Strict",
                            to: "/docs/rules/presets/strict",
                        },
                        {
                            label: "🟣 All",
                            to: "/docs/rules/presets/all",
                        },
                    ],
                    label: "🛠️ Presets",
                    position: "left",
                    to: "/docs/rules/presets",
                    type: "dropdown",
                },
                {
                    items: [
                        {
                            label: "🧬 TypeDoc Pipeline",
                            to: "/docs/typedoc-pipeline",
                        },
                        {
                            label: "🔧 Inspector Workflows",
                            to: "/docs/inspectors",
                        },
                        {
                            label: "🧩 API Reference",
                            to: "/docs/developer/api",
                        },
                        {
                            href: `${siteUrl}eslint-inspector/`,
                            label: "🔎 ESLint Inspector",
                        },
                        {
                            href: `${siteUrl}stylelint-inspector/`,
                            label: "🧪 Stylelint Inspector",
                        },
                    ],
                    label: "🧩 Dev",
                    position: "right",
                    to: "/docs/typedoc-pipeline",
                    type: "dropdown",
                },
                {
                    href: `https://github.com/${organizationName}/${projectName}`,
                    items: [
                        {
                            href: `https://github.com/${organizationName}/${projectName}`,
                            label: "󰊤 GitHub",
                        },
                        {
                            href: `https://www.npmjs.com/package/${projectName}`,
                            label: "󰏗 npm",
                        },
                        {
                            className: "navbar-dropdown-divider-before",
                            href: `${siteUrl}eslint-inspector/`,
                            label: "🔎 ESLint Inspector",
                        },
                        {
                            href: `${siteUrl}stylelint-inspector/`,
                            label: "🧪 Stylelint Inspector",
                        },
                        {
                            className: "navbar-dropdown-divider-before",
                            href: `https://github.com/${organizationName}/${projectName}/releases`,
                            label: "󰫑 Releases",
                        },
                        {
                            href: `https://github.com/${organizationName}/${projectName}/issues`,
                            label: "󰅙 Issues",
                        },
                    ],
                    label: "󰊤 GitHub",
                    position: "right",
                    type: "dropdown",
                },
                {
                    position: "right",
                    type: "search",
                },
            ],
            logo: {
                alt: "eslint-plugin-typedoc logo",
                height: 32,
                href: baseUrl,
                src: "img/logo_32x32.png",
                width: 32,
            },
            style: "dark",
            title: projectName,
        },
        prism: {
            additionalLanguages: [
                "bash",
                "json",
                "yaml",
                "typescript",
            ],
            darkTheme: prismThemes.dracula,
            defaultLanguage: "typescript",
            theme: prismThemes.github,
        },
        tableOfContents: {
            maxHeadingLevel: 4,
            minHeadingLevel: 2,
        },
        zoom: {
            background: {
                dark: "rgb(50, 50, 50)",
                light: "rgb(255, 255, 255)",
            },
            config: {},
            selector: ".markdown > img",
        },
    } satisfies Preset.ThemeConfig,
    themes: [
        "@docusaurus/theme-mermaid",
        [
            "@easyops-cn/docusaurus-search-local",
            {
                docsDir: ["site-docs", "../rules"],
                docsRouteBasePath: ["docs", "docs/rules"],
                explicitSearchResultPath: false,
                forceIgnoreNoIndex: true,
                fuzzyMatchingDistance: 1,
                hashed: true,
                hideSearchBarWithNoSearchContext: false,
                highlightSearchTermsOnTargetPage: true,
                indexBlog: false,
                indexDocs: true,
                indexPages: false,
                language: ["en"],
                removeDefaultStemmer: true,
                removeDefaultStopWordFilter: false,
                searchBarShortcut: true,
                searchBarShortcutHint: true,
                searchBarShortcutKeymap: "ctrl+k",
                searchResultContextMaxLength: 96,
                searchResultLimits: 8,
                useAllContextsWithNoSearchContext: false,
            },
        ],
    ],
    title: projectName,
    trailingSlash: false,
    url: siteOrigin,
};

export default config;
