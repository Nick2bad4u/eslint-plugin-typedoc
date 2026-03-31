/**
 * @packageDocumentation
 * Require key options in TypeDoc configuration objects.
 */

import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

import { getPreferredLineEnding } from "../_internal/doc-comments.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const defaultOptions = [] as const;

type MessageIds = "missingTypedocConfigOptions";
type Options = typeof defaultOptions;

const typedocConfigFileExpression =
    /(?:^|\\|\/)(?:typedoc(?:\.config)?\.(?:[cm]?js|ts)|typedoc\.json)$/u;

const requiredOptionDefaultsByName = {
    entryPoints: '["src/index.ts"]',
    tsconfig: '"./tsconfig.json"',
} as const;

const requiredOptionNames = Object.keys(
    requiredOptionDefaultsByName
) as readonly (keyof typeof requiredOptionDefaultsByName)[];

const normalizePathSeparators = (fileName: string): string =>
    fileName.replaceAll("\\", "/");

const isModuleExportsMemberExpression = (
    memberExpression: TSESTree.MemberExpression
): boolean => {
    if (
        memberExpression.object.type !== AST_NODE_TYPES.Identifier ||
        memberExpression.object.name !== "module"
    ) {
        return false;
    }

    if (
        memberExpression.computed ||
        memberExpression.property.type !== AST_NODE_TYPES.Identifier
    ) {
        return false;
    }

    return memberExpression.property.name === "exports";
};

const extractObjectExpression = (
    expression: TSESTree.Expression
): null | TSESTree.ObjectExpression => {
    if (expression.type === AST_NODE_TYPES.ObjectExpression) {
        return expression;
    }

    if (expression.type !== AST_NODE_TYPES.CallExpression) {
        return null;
    }

    const firstArgument = expression.arguments[0];

    return firstArgument?.type === AST_NODE_TYPES.ObjectExpression
        ? firstArgument
        : null;
};

const getTypedocConfigObjectFromProgram = (
    program: TSESTree.Program
): null | TSESTree.ObjectExpression => {
    for (const statement of program.body) {
        if (statement.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
            const declaration = statement.declaration;

            if (
                declaration.type !== AST_NODE_TYPES.ObjectExpression &&
                declaration.type !== AST_NODE_TYPES.CallExpression
            ) {
                continue;
            }

            const objectExpression = extractObjectExpression(declaration);

            if (objectExpression !== null) {
                return objectExpression;
            }
        }

        if (statement.type !== AST_NODE_TYPES.ExpressionStatement) {
            continue;
        }

        const { expression } = statement;

        if (
            expression.type !== AST_NODE_TYPES.AssignmentExpression ||
            expression.operator !== "=" ||
            expression.left.type !== AST_NODE_TYPES.MemberExpression ||
            !isModuleExportsMemberExpression(expression.left)
        ) {
            continue;
        }

        const objectExpression = extractObjectExpression(expression.right);

        if (objectExpression !== null) {
            return objectExpression;
        }
    }

    return null;
};

const getPropertyKeyName = (
    property: Readonly<TSESTree.Property>
): null | string => {
    if (property.computed) {
        return null;
    }

    if (property.key.type === AST_NODE_TYPES.Identifier) {
        return property.key.name;
    }

    if (property.key.type === AST_NODE_TYPES.Literal) {
        return typeof property.key.value === "string"
            ? property.key.value
            : null;
    }

    return null;
};

const getMissingOptionNames = (
    configObject: Readonly<TSESTree.ObjectExpression>
): readonly (keyof typeof requiredOptionDefaultsByName)[] => {
    const configuredOptionNames = new Set<string>();

    for (const property of configObject.properties) {
        if (
            property.type !== AST_NODE_TYPES.Property ||
            property.kind !== "init"
        ) {
            continue;
        }

        const keyName = getPropertyKeyName(property);

        if (keyName !== null) {
            configuredOptionNames.add(keyName);
        }
    }

    return requiredOptionNames.filter(
        (optionName) => !configuredOptionNames.has(optionName)
    );
};

const supportsSafeAutofix = (
    configObject: Readonly<TSESTree.ObjectExpression>
): boolean =>
    configObject.properties.every(
        (property) =>
            property.type === AST_NODE_TYPES.Property &&
            property.kind === "init" &&
            !property.computed
    );

/** Rule implementation for essential TypeDoc config option requirements. */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create: (context) => {
        const { sourceCode } = context;
        const lineEnding = getPreferredLineEnding(sourceCode);

        return {
            Program: (node: Readonly<TSESTree.Program>): void => {
                const normalizedFileName = normalizePathSeparators(
                    context.filename
                );

                if (!typedocConfigFileExpression.test(normalizedFileName)) {
                    return;
                }

                const configObject = getTypedocConfigObjectFromProgram(node);

                if (configObject === null) {
                    return;
                }

                const missingOptionNames = getMissingOptionNames(configObject);

                if (missingOptionNames.length === 0) {
                    return;
                }

                const missingOptionsList = missingOptionNames
                    .map((name) => `"${name}"`)
                    .join(", ");
                const messageId: MessageIds = "missingTypedocConfigOptions";

                const baseReportDescriptor = {
                    data: {
                        options: missingOptionsList,
                    },
                    messageId,
                    node: configObject,
                };

                if (!supportsSafeAutofix(configObject)) {
                    context.report(baseReportDescriptor);

                    return;
                }

                context.report({
                    ...baseReportDescriptor,
                    fix: (fixer) => {
                        const configObjectText =
                            sourceCode.getText(configObject);
                        const hasTrailingComma = /,\s*\}$/u.test(
                            configObjectText
                        );
                        const objectStartLineIndex =
                            (configObject.loc?.start.line ?? 1) - 1;
                        const objectStartLineText =
                            sourceCode.lines[objectStartLineIndex] ?? "";
                        const lineIndentation =
                            /^\s*/u.exec(objectStartLineText)?.[0] ?? "";
                        const indentation = lineIndentation;
                        let propertyIndentation = `${lineIndentation}    `;

                        for (const property of configObject.properties) {
                            if (
                                property.type !== AST_NODE_TYPES.Property ||
                                property.kind !== "init" ||
                                property.loc === null
                            ) {
                                continue;
                            }

                            propertyIndentation = " ".repeat(
                                property.loc.start.column
                            );
                            break;
                        }

                        const insertedProperties = missingOptionNames
                            .map(
                                (name) =>
                                    `${propertyIndentation}${name}: ${requiredOptionDefaultsByName[name]}`
                            )
                            .join(`,${lineEnding}`);

                        const insertionText = (() => {
                            if (configObject.properties.length === 0) {
                                return `${lineEnding}${insertedProperties}${lineEnding}${indentation}`;
                            }

                            if (hasTrailingComma) {
                                return `${insertedProperties}${lineEnding}${indentation}`;
                            }

                            return `,${lineEnding}${insertedProperties}${lineEnding}${indentation}`;
                        })();

                        return fixer.insertTextBeforeRange(
                            [
                                configObject.range[1] - 1,
                                configObject.range[1] - 1,
                            ],
                            insertionText
                        );
                    },
                });
            },
        };
    },
    defaultOptions,
    meta: {
        deprecated: false,
        docs: {
            description:
                "require essential options (entryPoints and tsconfig) in TypeDoc config objects.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            typedocConfigs: [
                "typedoc.configs.minimal",
                "typedoc.configs.recommended",
                "typedoc.configs.strict",
                "typedoc.configs.all",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/typedoc-config-requires-options",
        },
        fixable: "code",
        messages: {
            missingTypedocConfigOptions:
                "TypeDoc config is missing required option(s): {{options}}.",
        },
        schema: [],
        type: "problem",
    },
    name: "typedoc-config-requires-options",
});

export default rule;
