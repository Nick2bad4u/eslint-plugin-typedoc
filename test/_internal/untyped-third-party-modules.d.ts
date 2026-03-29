type EslintPluginModule = Readonly<Record<string, unknown>>;
type RemarkPluginModule = (...arguments_: readonly unknown[]) => unknown;

declare module "@microsoft/eslint-plugin-sdl" {
    const plugin: EslintPluginModule;
    export = plugin;
}

declare module "eslint-plugin-array-func" {
    const plugin: EslintPluginModule;
    export = plugin;
}

declare module "eslint-plugin-etc" {
    const plugin: EslintPluginModule;
    export = plugin;
}

declare module "eslint-plugin-listeners" {
    const plugin: EslintPluginModule;
    export = plugin;
}

declare module "eslint-plugin-loadable-imports" {
    const plugin: EslintPluginModule;
    export = plugin;
}

declare module "eslint-plugin-no-explicit-type-exports" {
    const plugin: EslintPluginModule;
    export = plugin;
}

declare module "eslint-plugin-no-function-declare-after-return" {
    const plugin: EslintPluginModule;
    export = plugin;
}

declare module "eslint-plugin-no-only-tests" {
    const plugin: EslintPluginModule;
    export = plugin;
}

declare module "eslint-plugin-no-unsanitized" {
    const plugin: EslintPluginModule;
    export = plugin;
}

declare module "eslint-plugin-no-use-extend-native" {
    const plugin: EslintPluginModule;
    export = plugin;
}

declare module "eslint-plugin-prefer-arrow" {
    const plugin: EslintPluginModule;
    export = plugin;
}

declare module "eslint-plugin-promise" {
    const plugin: EslintPluginModule;
    export = plugin;
}

declare module "eslint-plugin-redos" {
    const plugin: EslintPluginModule;
    export = plugin;
}

declare module "eslint-plugin-require-jsdoc" {
    const plugin: EslintPluginModule;
    export = plugin;
}

declare module "eslint-plugin-sort-class-members" {
    const plugin: EslintPluginModule;
    export = plugin;
}

declare module "eslint-plugin-total-functions" {
    const plugin: EslintPluginModule;
    export = plugin;
}

declare module "eslint-plugin-undefined-css-classes" {
    const plugin: EslintPluginModule;
    export = plugin;
}

declare module "eslint-plugin-write-good-comments" {
    const plugin: EslintPluginModule;
    export = plugin;
}

declare module "eslint-plugin-css-modules" {
    type CssModulesPlugin = EslintPluginModule & {
        readonly configs: {
            readonly recommended: {
                readonly rules: Readonly<Record<string, unknown>>;
            };
        };
    };

    const plugin: CssModulesPlugin;
    export = plugin;
}

declare module "remark-lint-code-block-split-list" {
    const plugin: RemarkPluginModule;
    export = plugin;
}

declare module "remark-lint-heading-whitespace" {
    const plugin: RemarkPluginModule;
    export = plugin;
}

declare module "remark-lint-no-empty-sections" {
    const plugin: RemarkPluginModule;
    export = plugin;
}

declare module "remark-lint-write-good" {
    const plugin: RemarkPluginModule;
    export = plugin;
}
