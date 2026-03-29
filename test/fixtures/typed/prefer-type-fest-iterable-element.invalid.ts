import type { SetEntry, SetElement, SetValues } from "type-aliases";

type ElementViaAlias = SetElement<MonitorIdSet>;
type EntryViaAlias = SetEntry<MonitorIdSet>;
type MonitorIdSet = Set<string>;
type ValueViaAlias = SetValues<MonitorIdSet>;

declare const entryViaAlias: EntryViaAlias;
declare const elementViaAlias: ElementViaAlias;
declare const valueViaAlias: ValueViaAlias;

String(entryViaAlias);
String(elementViaAlias);
String(valueViaAlias);

export const __typedFixtureModule = "typed-fixture-module";
