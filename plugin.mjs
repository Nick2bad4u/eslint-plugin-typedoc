import builtPlugin from "./dist/plugin.js";

/** @type {import("eslint").ESLint.Plugin} */
const plugin = {
    ...builtPlugin,
};

export default plugin;
