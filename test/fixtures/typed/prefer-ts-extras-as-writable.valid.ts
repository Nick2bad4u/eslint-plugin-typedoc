import { asWritable } from "ts-extras";
import type { Writable as AliasWritable } from "type-aliases";

type MutableByAlias = AliasWritable<ReadonlyRecord>;

type ReadonlyRecord = {
    readonly id: number;
    readonly name: string;
};

declare const readonlyRecord: ReadonlyRecord;

declare const mutableByAlias: MutableByAlias;

const mutableRecord = asWritable(readonlyRecord);

String(mutableRecord);
String(mutableByAlias);

export const __typedFixtureModule = "typed-fixture-module";
