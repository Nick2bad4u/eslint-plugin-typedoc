import type { IsNever, UnionMember } from "type-fest";

type UnionToIntersection<Union> = (
    Union extends any ? () => Union : never
) extends () => infer Intersection
    ? Intersection
    : never;

type LastOfUnion<Union> =
    IsNever<Union> extends true
        ? never
        : UnionToIntersection<
                Union extends any ? () => Union : never
            > extends () => infer Last
          ? Last
          : never;

type LastEventName = LastOfUnion<"open" | "close" | "reset">;

declare const lastEventName: LastEventName;

String(lastEventName);

export const __typedFixtureModule = "typed-fixture-module";
