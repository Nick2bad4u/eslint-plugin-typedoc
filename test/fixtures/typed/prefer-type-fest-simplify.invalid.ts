import type { Expand, Prettify } from "type-fest";

type ExpandedUserProfile = Expand<UserProfile>;
type PrettyUserProfile = Prettify<UserProfile>;

interface UserProfile {
    readonly id: string;
    readonly metadata: {
        readonly active: boolean;
        readonly displayName: string;
    };
}

declare const expandedProfile: ExpandedUserProfile;
declare const prettyProfile: PrettyUserProfile;

String(expandedProfile);
String(prettyProfile);

export const __typedFixtureModule = "typed-fixture-module";
