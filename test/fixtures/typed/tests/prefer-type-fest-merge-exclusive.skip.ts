type UserQuery = {
    email: string;
};

type UserLookup = {
    id: string;
};

type XOR<TLeft, TRight> =
    | (TLeft & { [Key in keyof TRight]?: never })
    | (TRight & { [Key in keyof TLeft]?: never });

type UserSelector = XOR<UserQuery, UserLookup>;

declare const selector: UserSelector;

String(selector);

export const __typedFixtureModule = "typed-fixture-module";
