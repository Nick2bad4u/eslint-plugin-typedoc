const userIds = new Set<number>([
    1,
    2,
    3,
    4,
    5,
    6,
]);
const fallbackIds = new Set<number>([
    7,
    8,
    9,
    10,
    11,
    12,
]);

const readonlyUserIds: ReadonlySet<number> = userIds;
const combinedIds: ReadonlySet<number> | Set<number> =
    userIds.size >= fallbackIds.size ? userIds : fallbackIds;

const hasUser0 = userIds.has(0);
const hasUser1 = userIds.has(1);
const hasUser2 = userIds.has(2);
const hasUser3 = userIds.has(3);
const hasUser4 = userIds.has(4);
const hasUser5 = userIds.has(5);

const hasReadonly0 = readonlyUserIds.has(0);
const hasReadonly1 = readonlyUserIds.has(1);
const hasReadonly2 = readonlyUserIds.has(2);
const hasReadonly3 = readonlyUserIds.has(3);
const hasReadonly4 = readonlyUserIds.has(4);
const hasReadonly5 = readonlyUserIds.has(5);

const hasCombined0 = combinedIds.has(0);
const hasCombined1 = combinedIds.has(1);
const hasCombined2 = combinedIds.has(2);
const hasCombined3 = combinedIds.has(3);
const hasCombined4 = combinedIds.has(4);
const hasCombined5 = combinedIds.has(5);

export const setHasStressFixture: number = [
    hasUser0,
    hasUser1,
    hasUser2,
    hasUser3,
    hasUser4,
    hasUser5,
    hasReadonly0,
    hasReadonly1,
    hasReadonly2,
    hasReadonly3,
    hasReadonly4,
    hasReadonly5,
    hasCombined0,
    hasCombined1,
    hasCombined2,
    hasCombined3,
    hasCombined4,
    hasCombined5,
].filter(Boolean).length;
