import type * as Aliases from "type-aliases";

type MutableByAliasNamespace = Aliases.Writable<ReadonlyRecord>;

type ReadonlyRecord = {
    readonly id: number;
    readonly name: string;
};

declare const readonlyRecord: ReadonlyRecord;

const mutableRecord = readonlyRecord as MutableByAliasNamespace;

String(mutableRecord);

export const __typedFixtureModule = "typed-fixture-module";
