import type { RemoveIndexSignature } from "type-aliases";

interface HeaderMapPayload {
    [headerName: string]: string;
    authorization: string;
}
type HeaderMapShouldSkip = RemoveIndexSignature<HeaderMapPayload>;

declare const headerMapShouldSkip: HeaderMapShouldSkip;

String(headerMapShouldSkip);

export const __typedFixtureModule = "typed-fixture-module";
