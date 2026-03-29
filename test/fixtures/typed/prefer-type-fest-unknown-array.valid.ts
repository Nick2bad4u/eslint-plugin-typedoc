import type { UnknownArray } from "type-fest";

type RawMessageBatch = UnknownArray;
type StreamPayloadList = UnknownArray;

declare const rawMessages: RawMessageBatch;
declare const streamPayloads: StreamPayloadList;

const firstRawMessage = rawMessages.at(0);
const firstStreamPayload = streamPayloads.at(0);

if (firstRawMessage === firstStreamPayload && firstRawMessage !== undefined) {
    throw new TypeError("Unexpected negative payload length");
}

export const __typedFixtureModule = "typed-fixture-module";
