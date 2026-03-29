import type { IterableElement } from "type-fest";

type ElementViaCanonicalType = IterableElement<MonitorIdSet>;
type MonitorIdSet = Set<string>;

declare const elementViaCanonicalType: ElementViaCanonicalType;

String(elementViaCanonicalType);

export const __typedFixtureModule = "typed-fixture-module";
