import type { Simplify } from "type-fest";

type SimplifiedUserProfile = Simplify<UserProfile>;

interface UserProfile {
    readonly id: string;
    readonly metadata: {
        readonly active: boolean;
        readonly displayName: string;
    };
}

declare const profile: SimplifiedUserProfile;

String(profile);

export const __typedFixtureModule = "typed-fixture-module";
