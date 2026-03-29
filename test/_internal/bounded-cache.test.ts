import { describe, expect, it } from "vitest";

import {
    getBoundedCacheValue,
    setBoundedCacheValue,
} from "../../src/_internal/bounded-cache";

describe("bounded cache helpers", () => {
    it("stores and reads nullable values without treating them as cache misses", () => {
        const cache = new Map<string, null | string>();

        setBoundedCacheValue({
            cache,
            key: "entry",
            maxEntries: 2,
            value: null,
        });

        expect(getBoundedCacheValue(cache, "entry")).toStrictEqual({
            found: true,
            value: null,
        });
        expect(cache.has("entry")).toBeTruthy();
    });

    it("treats cached undefined as a cache hit", () => {
        const cache = new Map<string, number | undefined>();

        setBoundedCacheValue({
            cache,
            key: "entry",
            maxEntries: 2,
            value: undefined,
        });

        expect(getBoundedCacheValue(cache, "entry")).toStrictEqual({
            found: true,
            value: undefined,
        });
    });

    it("evicts least-recently-used entries when max size is exceeded", () => {
        const cache = new Map<string, number>();

        setBoundedCacheValue({
            cache,
            key: "first",
            maxEntries: 2,
            value: 1,
        });
        setBoundedCacheValue({
            cache,
            key: "second",
            maxEntries: 2,
            value: 2,
        });

        // Mark first as most-recently-used.
        expect(getBoundedCacheValue(cache, "first")).toStrictEqual({
            found: true,
            value: 1,
        });

        setBoundedCacheValue({
            cache,
            key: "third",
            maxEntries: 2,
            value: 3,
        });

        expect(cache.has("first")).toBeTruthy();
        expect(cache.has("second")).toBeFalsy();
        expect(cache.has("third")).toBeTruthy();
    });

    it("does nothing when maxEntries is invalid", () => {
        const cache = new Map<string, number>();

        setBoundedCacheValue({
            cache,
            key: "entry",
            maxEntries: 0,
            value: 1,
        });

        expect(cache.size).toBe(0);
        expect(getBoundedCacheValue(cache, "entry")).toStrictEqual({
            found: false,
        });
    });
});
