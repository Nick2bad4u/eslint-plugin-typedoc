/**
 * @packageDocumentation
 * Shared type-aware guardrails for skipping risky rule reports/fixes on
 * `@typescript-eslint` AST-node expressions.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray, UnknownRecord } from "type-fest";
import type ts from "typescript";

import parser from "@typescript-eslint/parser";
import {
    isTypeAnyType,
    isTypeUnknownType,
} from "@typescript-eslint/type-utils";
import {
    arrayIncludes,
    isDefined,
    objectHasOwn,
    safeCastTo,
    stringSplit,
} from "ts-extras";

import type { TypedRuleServices } from "./typed-rule.js";

import { getBoundedCacheValue, setBoundedCacheValue } from "./bounded-cache.js";
import { getConstrainedTypeAtLocationWithFallback } from "./constrained-type-at-location.js";
import { TYPESCRIPT_ESLINT_UTILS_MODULE_SOURCE } from "./module-source.js";
import { safeTypeOperation } from "./safe-type-operation.js";
import { getVariableInScopeChain } from "./scope-variable.js";
import { setContainsValue } from "./set-membership.js";
import {
    getTypeCheckerApparentType,
    getTypeCheckerBaseConstraintType,
    getTypeCheckerTypeArguments,
} from "./type-checker-compat.js";
import { recordTypedPathPrefilterEvaluation } from "./typed-path-telemetry.js";

const TYPESCRIPT_ESLINT_PACKAGE_SEGMENT = "@typescript-eslint" as const;
const TSESTREE_NAMESPACE_NAME = "TSESTree" as const;
const PATH_SEPARATOR = "/" as const;
const ASCII_DIGIT_ZERO_CODE_POINT = 48 as const;
const ASCII_DIGIT_NINE_CODE_POINT = 57 as const;
const ASCII_UPPERCASE_A_CODE_POINT = 65 as const;
const ASCII_UPPERCASE_Z_CODE_POINT = 90 as const;
const ASCII_UNDERSCORE_CODE_POINT = 95 as const;
const ASCII_DOLLAR_SIGN_CODE_POINT = 36 as const;
const ASCII_LOWERCASE_A_CODE_POINT = 97 as const;
const ASCII_LOWERCASE_Z_CODE_POINT = 122 as const;

/**
 * ESTree metadata keys that never contribute to semantic type-reference
 * detection during fallback node traversal.
 */
const IGNORED_TRAVERSAL_KEYS = new Set<string>([
    "comments",
    "end",
    "loc",
    "parent",
    "range",
    "start",
    "tokens",
]);

const namespaceImportNamesBySourceCode = new WeakMap<
    Readonly<TSESLint.SourceCode>,
    ReadonlySet<string>
>();

const MAX_PARSED_DEFINITION_TEXT_CACHE_ENTRIES = 512 as const;

/**
 * Upper bound for fallback definition text that may be reparsed as a synthetic
 * program.
 *
 * @remarks
 * Extremely large definition snippets provide little signal for this fallback
 * and can degrade lint latency in adversarial files.
 */
const MAX_DEFINITION_TEXT_PARSE_LENGTH = 16_384 as const;

const parsedDefinitionTextProgramBySourceText = new Map<
    string,
    null | Readonly<TSESTree.Program>
>();

const cacheParsedDefinitionTextProgram = ({
    cacheKey,
    parsedProgram,
}: Readonly<{
    cacheKey: string;
    parsedProgram: null | Readonly<TSESTree.Program>;
}>): void => {
    setBoundedCacheValue({
        cache: parsedDefinitionTextProgramBySourceText,
        key: cacheKey,
        maxEntries: MAX_PARSED_DEFINITION_TEXT_CACHE_ENTRIES,
        value: parsedProgram,
    });
};

/**
 * Determine whether a code point is valid within an ASCII identifier token.
 */
const isAsciiIdentifierCodePoint = (codePoint: number): boolean =>
    (codePoint >= ASCII_UPPERCASE_A_CODE_POINT &&
        codePoint <= ASCII_UPPERCASE_Z_CODE_POINT) ||
    (codePoint >= ASCII_LOWERCASE_A_CODE_POINT &&
        codePoint <= ASCII_LOWERCASE_Z_CODE_POINT) ||
    (codePoint >= ASCII_DIGIT_ZERO_CODE_POINT &&
        codePoint <= ASCII_DIGIT_NINE_CODE_POINT) ||
    codePoint === ASCII_UNDERSCORE_CODE_POINT ||
    codePoint === ASCII_DOLLAR_SIGN_CODE_POINT;

/**
 * Determine whether the code point at `index` is outside identifier syntax.
 */
const isIdentifierBoundaryAt = (text: string, index: number): boolean => {
    if (index < 0 || index >= text.length) {
        return true;
    }

    const codePoint = text.codePointAt(index);
    if (!isDefined(codePoint)) {
        return true;
    }

    return !isAsciiIdentifierCodePoint(codePoint);
};

/**
 * Advance an index over ASCII whitespace.
 */
const skipAsciiWhitespace = (text: string, startIndex: number): number => {
    let index = startIndex;

    while (index < text.length) {
        const character = text.at(index);

        if (
            character !== " " &&
            character !== "\n" &&
            character !== "\r" &&
            character !== "\t"
        ) {
            break;
        }

        index += 1;
    }

    return index;
};

const isTypeScriptEslintDeclarationPath = (fileName: string): boolean => {
    const normalizedFileName = fileName.replaceAll("\\", PATH_SEPARATOR);
    const pathSegments = stringSplit(normalizedFileName, PATH_SEPARATOR).filter(
        (segment) => segment.length > 0
    );

    const packagePathSegment: string = TYPESCRIPT_ESLINT_PACKAGE_SEGMENT;

    return arrayIncludes(pathSegments, packagePathSegment);
};

const isUnknownRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null;

/**
 * Return `true` when a record key should be excluded from semantic traversal.
 */
const shouldSkipTraversalKey = (key: string): boolean =>
    setContainsValue(IGNORED_TRAVERSAL_KEYS, key);

const createDefinitionTextParseCandidates = (
    definitionNodeText: string
): readonly string[] => {
    const trimmedText = definitionNodeText.trim();

    if (
        trimmedText.length === 0 ||
        trimmedText.length > MAX_DEFINITION_TEXT_PARSE_LENGTH
    ) {
        return [];
    }

    const parseCandidates = new Set<string>([
        `(${trimmedText});`,
        `const ${trimmedText};`,
        `type __typefest_tmp__ = ${trimmedText};`,
        trimmedText,
    ]);

    return [...parseCandidates];
};

const parseDefinitionTextProgram = (
    definitionNodeText: string
): null | Readonly<TSESTree.Program> => {
    const cacheKey = definitionNodeText.trim();

    if (cacheKey.length === 0) {
        return null;
    }

    const cachedProgramLookup = getBoundedCacheValue(
        parsedDefinitionTextProgramBySourceText,
        cacheKey
    );

    if (cachedProgramLookup.found) {
        return cachedProgramLookup.value;
    }

    const parseCandidates = createDefinitionTextParseCandidates(cacheKey);

    for (const parseCandidate of parseCandidates) {
        const parsedResult = safeTypeOperation({
            operation: () =>
                parser.parseForESLint(parseCandidate, {
                    ecmaVersion: "latest",
                    loc: false,
                    range: false,
                    sourceType: "module",
                }),
            reason: "ts-eslint-node-autofix-parse-definition-candidate-failed",
        });

        if (!parsedResult.ok) {
            continue;
        }

        cacheParsedDefinitionTextProgram({
            cacheKey,
            parsedProgram: parsedResult.value.ast,
        });

        return parsedResult.value.ast;
    }

    cacheParsedDefinitionTextProgram({
        cacheKey,
        parsedProgram: null,
    });

    return null;
};

const getTypeScriptEslintNamespaceImportNames = (
    sourceCode: Readonly<TSESLint.SourceCode>
): ReadonlySet<string> => {
    const cachedNamespaceNames =
        namespaceImportNamesBySourceCode.get(sourceCode);
    if (isDefined(cachedNamespaceNames)) {
        return cachedNamespaceNames;
    }

    const namespaceNames = new Set<string>();
    const programStatements = sourceCode.ast?.body;

    if (!Array.isArray(programStatements)) {
        namespaceImportNamesBySourceCode.set(sourceCode, namespaceNames);

        return namespaceNames;
    }

    for (const statement of programStatements) {
        if (
            statement.type !== "ImportDeclaration" ||
            statement.source.value !== TYPESCRIPT_ESLINT_UTILS_MODULE_SOURCE
        ) {
            continue;
        }

        for (const specifier of statement.specifiers) {
            if (specifier.type === "ImportNamespaceSpecifier") {
                namespaceNames.add(specifier.local.name);
                continue;
            }

            if (
                specifier.type === "ImportSpecifier" &&
                specifier.imported.type === "Identifier" &&
                specifier.imported.name === TSESTREE_NAMESPACE_NAME
            ) {
                namespaceNames.add(specifier.local.name);
            }
        }
    }

    const readonlyNamespaceNames: ReadonlySet<string> = new Set(namespaceNames);

    namespaceImportNamesBySourceCode.set(sourceCode, readonlyNamespaceNames);

    return readonlyNamespaceNames;
};

const isTypeScriptEslintQualifiedTypeName = (
    typeName: unknown,
    namespaceNames: ReadonlySet<string>
): boolean => {
    if (!isUnknownRecord(typeName) || typeName["type"] !== "TSQualifiedName") {
        return false;
    }

    const left = typeName["left"];
    const right = typeName["right"];

    return (
        isUnknownRecord(left) &&
        left["type"] === "Identifier" &&
        typeof left["name"] === "string" &&
        setContainsValue(namespaceNames, left["name"]) &&
        isUnknownRecord(right) &&
        right["type"] === "Identifier" &&
        typeof right["name"] === "string"
    );
};

const containsTypeScriptEslintTypeReference = (
    rootNode: unknown,
    namespaceNames: ReadonlySet<string>
): boolean => {
    if (namespaceNames.size === 0) {
        return false;
    }

    const visitedNodes = new Set<UnknownRecord>();
    const pendingNodes: unknown[] = [rootNode];

    while (pendingNodes.length > 0) {
        const currentNode = pendingNodes.pop();

        if (
            !isUnknownRecord(currentNode) ||
            setContainsValue(visitedNodes, currentNode)
        ) {
            continue;
        }

        visitedNodes.add(currentNode);

        if (
            currentNode["type"] === "TSTypeReference" &&
            isTypeScriptEslintQualifiedTypeName(
                currentNode["typeName"],
                namespaceNames
            )
        ) {
            return true;
        }

        if (isTypeScriptEslintQualifiedTypeName(currentNode, namespaceNames)) {
            return true;
        }

        for (const key in currentNode) {
            if (
                !objectHasOwn(currentNode, key) ||
                shouldSkipTraversalKey(key)
            ) {
                continue;
            }

            const value = currentNode[key];

            if (Array.isArray(value)) {
                for (const entry of value) {
                    pendingNodes.push(entry);
                }
                continue;
            }

            if (isUnknownRecord(value)) {
                pendingNodes.push(value);
            }
        }
    }

    return false;
};

const containsTypeScriptEslintTypeReferenceText = (
    text: string,
    namespaceNames: ReadonlySet<string>
): boolean => {
    if (namespaceNames.size === 0) {
        return false;
    }

    let containsPotentialNamespaceTextReference = false;

    for (const namespaceName of namespaceNames) {
        let searchStartIndex = 0;

        while (searchStartIndex < text.length) {
            const namespaceIndex = text.indexOf(
                namespaceName,
                searchStartIndex
            );

            if (namespaceIndex === -1) {
                break;
            }

            const afterNamespaceIndex = namespaceIndex + namespaceName.length;

            if (
                isIdentifierBoundaryAt(text, namespaceIndex - 1) &&
                isIdentifierBoundaryAt(text, afterNamespaceIndex)
            ) {
                const nextTokenIndex = skipAsciiWhitespace(
                    text,
                    afterNamespaceIndex
                );

                if (text.at(nextTokenIndex) === ".") {
                    containsPotentialNamespaceTextReference = true;
                    break;
                }
            }

            searchStartIndex = afterNamespaceIndex;
        }

        if (containsPotentialNamespaceTextReference) {
            break;
        }
    }

    if (!containsPotentialNamespaceTextReference) {
        return false;
    }

    const parsedProgram = parseDefinitionTextProgram(text);

    if (parsedProgram === null) {
        return false;
    }

    return containsTypeScriptEslintTypeReference(parsedProgram, namespaceNames);
};

const createTypeScriptEslintNodeLikeExpressionByDefinitionChecker = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>(
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
    namespaceNames: ReadonlySet<string>
): ((expression: Readonly<TSESTree.Expression>) => boolean) => {
    const definitionNodeTextByNode = new WeakMap<
        Readonly<TSESTree.Node>,
        string
    >();

    const astNodeLikeByVariable = new WeakMap<
        Readonly<TSESLint.Scope.Variable>,
        boolean
    >();

    const sourceCode = context.sourceCode;

    const getDefinitionNodeText = (
        definitionNode: Readonly<TSESTree.Node>
    ): string => {
        const cachedText = definitionNodeTextByNode.get(definitionNode);
        if (isDefined(cachedText)) {
            return cachedText;
        }

        const definitionNodeText = sourceCode.getText(definitionNode);

        definitionNodeTextByNode.set(definitionNode, definitionNodeText);

        return definitionNodeText;
    };

    return (expression) => {
        if (namespaceNames.size === 0) {
            return false;
        }

        if (expression.type !== "Identifier") {
            return false;
        }

        const resolutionResult = safeTypeOperation({
            operation: () => {
                const currentScope = sourceCode.getScope(expression);
                const variable = getVariableInScopeChain(
                    currentScope,
                    expression.name
                );

                if (variable === null) {
                    return false;
                }

                const cachedVariableResult =
                    astNodeLikeByVariable.get(variable);

                if (isDefined(cachedVariableResult)) {
                    return cachedVariableResult;
                }

                const visitedDefinitionNodes = new Set<TSESTree.Node>();
                const pendingDefinitionNodes: TSESTree.Node[] = [];

                const enqueueDefinitionNode = (
                    node: null | Readonly<TSESTree.Node> | undefined
                ): void => {
                    if (node === null || !isDefined(node)) {
                        return;
                    }

                    if (setContainsValue(visitedDefinitionNodes, node)) {
                        return;
                    }

                    pendingDefinitionNodes.push(node);
                };

                for (const definition of variable.defs) {
                    enqueueDefinitionNode(definition.node);
                }

                let variableReferencesTypeScriptEslintNode = false;

                while (pendingDefinitionNodes.length > 0) {
                    const definitionNode = pendingDefinitionNodes.pop();

                    if (!isDefined(definitionNode)) {
                        continue;
                    }

                    visitedDefinitionNodes.add(definitionNode);

                    if (
                        containsTypeScriptEslintTypeReference(
                            definitionNode,
                            namespaceNames
                        )
                    ) {
                        variableReferencesTypeScriptEslintNode = true;
                        break;
                    }

                    const definitionNodeText =
                        getDefinitionNodeText(definitionNode);
                    if (
                        containsTypeScriptEslintTypeReferenceText(
                            definitionNodeText,
                            namespaceNames
                        )
                    ) {
                        variableReferencesTypeScriptEslintNode = true;
                        break;
                    }

                    if (
                        definitionNode.type === "VariableDeclarator" &&
                        definitionNode.init !== null &&
                        definitionNode.init.type === "MemberExpression" &&
                        definitionNode.init.object.type === "Identifier"
                    ) {
                        const { object } = definitionNode.init;
                        const objectVariable = getVariableInScopeChain(
                            currentScope,
                            object.name
                        );

                        if (objectVariable === null) {
                            continue;
                        }

                        const cachedObjectVariableResult =
                            astNodeLikeByVariable.get(objectVariable);

                        if (cachedObjectVariableResult === true) {
                            variableReferencesTypeScriptEslintNode = true;
                            break;
                        }

                        for (const objectDefinition of objectVariable.defs) {
                            enqueueDefinitionNode(objectDefinition.node);
                        }
                    }
                }

                astNodeLikeByVariable.set(
                    variable,
                    variableReferencesTypeScriptEslintNode
                );

                return variableReferencesTypeScriptEslintNode;
            },
            reason: "ts-eslint-node-autofix-definition-fallback-failed",
        });

        if (!resolutionResult.ok) {
            return false;
        }

        return resolutionResult.value;
    };
};

const collectNestedTypeArguments = (
    checker: Readonly<ts.TypeChecker>,
    type: Readonly<ts.Type>
): readonly ts.Type[] => {
    const collectedTypes: ts.Type[] = [];

    const aliasTypeArguments = safeCastTo<
        Readonly<{
            aliasTypeArguments?: readonly ts.Type[];
        }>
    >(type).aliasTypeArguments;

    if (isDefined(aliasTypeArguments)) {
        for (const aliasTypeArgument of aliasTypeArguments) {
            collectedTypes.push(aliasTypeArgument);
        }
    }

    const checkerTypeArgumentsResult = safeTypeOperation({
        operation: () => getTypeCheckerTypeArguments(checker, type) ?? [],
        reason: "ts-eslint-node-autofix-get-type-arguments-failed",
    });

    if (checkerTypeArgumentsResult.ok) {
        for (const checkerTypeArgument of checkerTypeArgumentsResult.value) {
            collectedTypes.push(checkerTypeArgument);
        }
    }

    return collectedTypes;
};

/**
 * Determine whether a TypeScript type resolves to an `@typescript-eslint` AST
 * node type.
 *
 * @param checker - Type checker for symbol and declaration inspection.
 * @param type - Candidate type to inspect.
 *
 * @returns `true` when the candidate resolves to a `TSESTree` AST type.
 */
export const isTypeScriptEslintAstType = (
    checker: Readonly<ts.TypeChecker>,
    type: Readonly<ts.Type>
): boolean => {
    const visitedTypes = new Set<ts.Type>();
    const pendingTypes: ts.Type[] = [safeCastTo(type)];

    while (pendingTypes.length > 0) {
        const currentType = pendingTypes.pop();

        if (
            !isDefined(currentType) ||
            setContainsValue(visitedTypes, currentType)
        ) {
            continue;
        }

        visitedTypes.add(currentType);

        if (isTypeAnyType(currentType) || isTypeUnknownType(currentType)) {
            continue;
        }

        const symbol = currentType.aliasSymbol ?? currentType.getSymbol();

        if (isDefined(symbol)) {
            const declarations = symbol.getDeclarations() ?? [];

            const hasTypeScriptEslintDeclaration = declarations.some(
                (declaration) =>
                    isTypeScriptEslintDeclarationPath(
                        declaration.getSourceFile().fileName
                    )
            );

            if (hasTypeScriptEslintDeclaration) {
                return true;
            }
        }

        if (currentType.isUnionOrIntersection()) {
            for (const typePart of currentType.types) {
                pendingTypes.push(typePart);
            }
        }

        const nestedTypeArguments = collectNestedTypeArguments(
            checker,
            currentType
        );
        if (nestedTypeArguments.length > 0) {
            for (const nestedTypeArgument of nestedTypeArguments) {
                pendingTypes.push(nestedTypeArgument);
            }
        }

        const apparentType = getTypeCheckerApparentType(checker, currentType);
        if (isDefined(apparentType) && apparentType !== currentType) {
            pendingTypes.push(apparentType);
        }

        const baseConstraintType = getTypeCheckerBaseConstraintType(
            checker,
            currentType
        );
        if (
            isDefined(baseConstraintType) &&
            baseConstraintType !== currentType
        ) {
            pendingTypes.push(baseConstraintType);
        }
    }

    return false;
};

/**
 * Build a predicate that skips rule reporting/fixing when the compared
 * expression resolves to an `@typescript-eslint` AST node.
 *
 * @param context - Rule context for typed parser services.
 * @param typedServices - Prevalidated typed services. Pass `null`/`undefined`
 *   to run definition-only fallback logic with no checker calls.
 *
 * @returns Expression predicate that returns `true` when the current rule
 *   should skip reporting/fixing for the expression.
 */
export const createTypeScriptEslintNodeExpressionSkipChecker = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>(
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
    typedServices?: Readonly<TypedRuleServices>
): ((expression: Readonly<TSESTree.Expression>) => boolean) => {
    const shouldSkipExpressionCache = new WeakMap<
        Readonly<TSESTree.Expression>,
        boolean
    >();

    const namespaceNames = getTypeScriptEslintNamespaceImportNames(
        context.sourceCode
    );

    const isTypeScriptEslintNodeLikeExpressionByDefinition =
        createTypeScriptEslintNodeLikeExpressionByDefinitionChecker(
            context,
            namespaceNames
        );
    const telemetryFilePath = context.physicalFilename;

    return (expression) => {
        const cachedResult = shouldSkipExpressionCache.get(expression);

        if (isDefined(cachedResult)) {
            return cachedResult;
        }

        const shouldSkipByDefinition =
            isTypeScriptEslintNodeLikeExpressionByDefinition(expression);

        recordTypedPathPrefilterEvaluation({
            filePath: telemetryFilePath,
            prefilterHit: shouldSkipByDefinition,
        });

        if (shouldSkipByDefinition) {
            shouldSkipExpressionCache.set(expression, true);

            return true;
        }

        if (!isDefined(typedServices)) {
            shouldSkipExpressionCache.set(expression, false);

            return false;
        }

        const { checker, parserServices } = typedServices;

        const isNodeTypedExpressionResult = safeTypeOperation({
            operation: () => {
                const expressionType = getConstrainedTypeAtLocationWithFallback(
                    checker,
                    expression,
                    parserServices,
                    "ts-eslint-node-autofix-expression-type-resolution-failed"
                );

                if (!isDefined(expressionType)) {
                    return false;
                }

                return isTypeScriptEslintAstType(checker, expressionType);
            },
            reason: "ts-eslint-node-autofix-expression-check-failed",
        });

        if (
            isNodeTypedExpressionResult.ok &&
            isNodeTypedExpressionResult.value
        ) {
            shouldSkipExpressionCache.set(expression, true);

            return true;
        }

        shouldSkipExpressionCache.set(expression, false);

        return false;
    };
};
