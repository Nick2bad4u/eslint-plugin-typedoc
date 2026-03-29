import type * as Aliases from "type-aliases";

type HeaderMapByNamespaceAlias = Aliases.RemoveIndexSignature<HeaderMapPayload>;
interface HeaderMapPayload {
    [headerName: string]: string;
    authorization: string;
}

declare const headerMapByNamespaceAlias: HeaderMapByNamespaceAlias;

String(headerMapByNamespaceAlias);

export const __typedFixtureModule = "typed-fixture-module";
