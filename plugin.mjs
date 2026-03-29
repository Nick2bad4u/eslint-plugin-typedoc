const distPluginModuleUrl = new URL("./dist/plugin.js", import.meta.url).href;
const builtPlugin = /** @type {{ default: import("eslint").ESLint.Plugin }} */ (
    await import(distPluginModuleUrl)
).default;

/** @type {import("eslint").ESLint.Plugin} */
const plugin = {
    ...builtPlugin,
};

export default plugin;
