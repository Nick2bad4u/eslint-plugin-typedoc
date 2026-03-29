import type { ArrayLength } from "type-fest";

type EventSteps = readonly ["queued", "running", "done"];

type StepCount = ArrayLength<EventSteps>;

interface TelemetryRecord {
    readonly length: number;
    readonly name: string;
}

type RecordLength = TelemetryRecord["length"];

declare const stepCount: StepCount;
declare const recordLength: RecordLength;

String(stepCount);
String(recordLength);

export const __typedFixtureModule = "typed-fixture-module";
