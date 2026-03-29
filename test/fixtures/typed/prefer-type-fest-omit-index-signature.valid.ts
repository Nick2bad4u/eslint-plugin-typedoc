import type { OmitIndexSignature } from "type-fest";

type HeaderMapCanonical = OmitIndexSignature<HeaderMapPayload>;
interface HeaderMapPayload {
    [headerName: string]: string;
    authorization: string;
}

declare const headerMapCanonical: HeaderMapCanonical;

String(headerMapCanonical);

export const __typedFixtureModule = "typed-fixture-module";
