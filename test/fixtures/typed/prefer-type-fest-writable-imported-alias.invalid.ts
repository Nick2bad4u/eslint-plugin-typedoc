import type { Mutable } from "type-aliases";

interface ReadonlyMonitor {
    readonly endpoint: string;
    readonly intervalMs: number;
}

type WritableMonitor = Mutable<ReadonlyMonitor>;

declare const writableMonitor: WritableMonitor;

String(writableMonitor);

export const __typedFixtureModule = "typed-fixture-module";
