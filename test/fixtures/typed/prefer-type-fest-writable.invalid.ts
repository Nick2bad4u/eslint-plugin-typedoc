type Mutable<T> = {
    -readonly [K in keyof T]: T[K];
};

interface ReadonlyUser {
    readonly id: string;
    readonly tags: readonly string[];
}

declare const mutableUser: Mutable<ReadonlyUser>;

type WritableUser = {
    -readonly [K in keyof ReadonlyUser]: ReadonlyUser[K];
};

declare const writableUser: WritableUser;

const { id: mutableId } = mutableUser;
const { id: writableId } = writableUser;

export const __typedFixtureModule = String(mutableId) + String(writableId);
