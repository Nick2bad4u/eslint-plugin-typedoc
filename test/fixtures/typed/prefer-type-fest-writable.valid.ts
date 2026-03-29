import type { Writable } from "type-fest";

type MutableOptional<T> = {
    -readonly [K in keyof T]?: T[K];
};

interface ReadonlyUser {
    readonly id: string;
    readonly tags: readonly string[];
}

type WritableUser = Writable<ReadonlyUser>;

declare const writableUser: WritableUser;
declare const maybeWritableUser: MutableOptional<ReadonlyUser>;

const { id: writableId } = writableUser;
const { id: maybeId } = maybeWritableUser;

export const __typedFixtureModule = String(writableId) + String(maybeId);
