import type { TupleOf } from "type-fest";

type MonitorTuple = Readonly<TupleOf<3, string>>;

declare const monitorTuple: MonitorTuple;

String(monitorTuple);

export const __typedFixtureModule = "typed-fixture-module";
