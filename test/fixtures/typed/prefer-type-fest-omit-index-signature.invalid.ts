import type { RemoveIndexSignature } from "type-aliases";

type HeaderMapByAlias = RemoveIndexSignature<HeaderMapPayload>;
interface HeaderMapPayload {
    [headerName: string]: string;
    authorization: string;
}

declare const headerMapByAlias: HeaderMapByAlias;

String(headerMapByAlias);

export const __typedFixtureModule = "typed-fixture-module";
