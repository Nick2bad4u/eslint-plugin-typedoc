import type { Writable, Writable as MutableAlias } from "type-fest";
import type * as TypeFest from "type-fest";

type ReadonlyRecord = {
    readonly id: number;
    readonly name: string;
};

declare const readonlyRecord: ReadonlyRecord;

const mutableByNamedImport = readonlyRecord as Writable<ReadonlyRecord>;
const mutableByAliasedImport = readonlyRecord as MutableAlias<ReadonlyRecord>;
const mutableByNamespace = readonlyRecord as TypeFest.Writable<ReadonlyRecord>;

String(mutableByNamedImport);
String(mutableByAliasedImport);
String(mutableByNamespace);

export const __typedFixtureModule = "typed-fixture-module";
