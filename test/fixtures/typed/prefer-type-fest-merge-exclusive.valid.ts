import type { MergeExclusive } from "type-fest";

type UserQuery = {
    email: string;
};

type UserLookup = {
    id: string;
};

type UserSelector = MergeExclusive<UserQuery, UserLookup>;

declare const selector: UserSelector;

String(selector);

export const __typedFixtureModule = "typed-fixture-module";
