/**
 * Extend Prism grammars used by Docusaurus code blocks.
 *
 * We add dedicated tokenization for JSDoc tags like `@example`, `@see`, and
 * `@category` inside TypeScript/JavaScript comment blocks so TypeDoc snippets
 * are easier to scan.
 */
const JSDOC_TAG_PATTERN = /(^\s*\*?\s*)@[a-z][\w-]*/im;
const COMMENT_TOKEN_NAMES = ["comment", "doc-comment"];

/**
 * @param {import("prismjs").GrammarToken | undefined} commentToken
 */
const addJsDocTagToken = (commentToken) => {
    if (typeof commentToken !== "object" || commentToken === null) {
        return;
    }

    const existingInside =
        typeof commentToken.inside === "object" && commentToken.inside !== null
            ? commentToken.inside
            : {};

    if (Object.hasOwn(existingInside, "jsdoc-tag")) {
        return;
    }

    commentToken.inside = {
        "jsdoc-tag": {
            alias: "keyword",
            lookbehind: true,
            pattern: JSDOC_TAG_PATTERN,
        },
        ...existingInside,
    };
};

/**
 * @param {import("prismjs").GrammarToken
 *     | readonly import("prismjs").GrammarToken[]
 *     | undefined} grammarToken
 */
const addTagsToGrammarToken = (grammarToken) => {
    if (grammarToken === undefined) {
        return;
    }

    if (Array.isArray(grammarToken)) {
        for (const commentToken of grammarToken) {
            addJsDocTagToken(commentToken);
        }

        return;
    }

    addJsDocTagToken(grammarToken);
};

/**
 * @param {import("prismjs").Grammar} grammar
 */
const addTagsToGrammarComments = (grammar) => {
    for (const commentTokenName of COMMENT_TOKEN_NAMES) {
        if (!(commentTokenName in grammar)) {
            continue;
        }

        addTagsToGrammarToken(grammar[commentTokenName]);
    }
};

module.exports = function prismIncludeLanguages(PrismObject) {
    const languageNames = [
        "javascript",
        "jsx",
        "typescript",
        "tsx",
    ];

    for (const languageName of languageNames) {
        const grammar = PrismObject.languages[languageName];

        if (grammar === undefined) {
            continue;
        }

        addTagsToGrammarComments(grammar);
    }

    return PrismObject;
};
