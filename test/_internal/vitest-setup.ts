/**
 * @packageDocumentation
 * Vitest global setup helpers used by selector-aware unit-test doubles.
 */

type RuleCreateFunction = (...args: readonly unknown[]) => unknown;

/** Guard unknown values into object records. */
const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
    typeof value === "object" && value !== null;

/**
 * Detect whether a listener key is an ESLint selector entry rather than a plain
 * node-type listener key.
 */
const isSelectorListenerKey = (listenerKey: string): boolean =>
    listenerKey.includes("[") || listenerKey.includes(":");

/**
 * Resolve a selector listener that targets a plain node type key.
 */
const resolveSelectorListener = (
    listeners: Readonly<Record<string, unknown>>,
    nodeType: string
): unknown => {
    for (const [listenerKey, listener] of Object.entries(listeners)) {
        if (
            typeof listener === "function" &&
            isSelectorListenerKey(listenerKey) &&
            (listenerKey === nodeType ||
                listenerKey.startsWith(`${nodeType}[`) ||
                listenerKey.startsWith(`${nodeType}:`))
        ) {
            return listener;
        }
    }

    return undefined;
};

/**
 * Build a selector-aware listener proxy for undecorated rule-unit tests.
 */
const createSelectorAwareListenerMap = (listenerMap: unknown): unknown => {
    if (!isRecord(listenerMap)) {
        return listenerMap;
    }

    const listenerRecord = listenerMap;

    return new Proxy(listenerRecord, {
        get(target, property, receiver): unknown {
            if (
                typeof property === "string" &&
                !Reflect.has(target, property)
            ) {
                const selectorListener = resolveSelectorListener(
                    target,
                    property
                );

                if (selectorListener !== undefined) {
                    return selectorListener;
                }
            }

            return Reflect.get(target, property, receiver);
        },
    });
};

/**
 * Test-only passthrough for `createTypedRule` that preserves selector listeners
 * while exposing plain node listeners for undecorated unit harnesses.
 */
const createTypedRuleSelectorAwarePassThroughImpl = (
    definition: unknown
): unknown => {
    if (!isRecord(definition)) {
        return definition;
    }

    const createCandidate = definition["create"];

    if (typeof createCandidate !== "function") {
        return definition;
    }

    const create = createCandidate as RuleCreateFunction;

    return {
        ...definition,
        create: (...args: readonly unknown[]) =>
            createSelectorAwareListenerMap(create(...args)),
    };
};

if (!("createTypedRuleSelectorAwarePassThrough" in globalThis)) {
    Object.defineProperty(
        globalThis,
        "createTypedRuleSelectorAwarePassThrough",
        {
            configurable: true,
            enumerable: false,
            value: createTypedRuleSelectorAwarePassThroughImpl,
            writable: false,
        }
    );
}
