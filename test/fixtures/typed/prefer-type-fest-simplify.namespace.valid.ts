import type * as Aliases from "type-fest";

interface UserProfile {
    readonly id: string;
    readonly metadata: {
        readonly active: boolean;
        readonly displayName: string;
    };
}

type UsesNamespaceSimplify = Aliases.Expand<UserProfile>;

declare const usesNamespaceSimplify: UsesNamespaceSimplify;

String(usesNamespaceSimplify);

export const __typedFixtureModule = "typed-fixture-module";
