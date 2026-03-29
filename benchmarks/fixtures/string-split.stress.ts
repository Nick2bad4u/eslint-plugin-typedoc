const phrase0 = "alpha bravo charlie";
const phrase1 = "delta echo foxtrot";
const phrase2 = "golf hotel india";
const phrase3 = "juliet kilo lima";
const phrase4 = "mike november oscar";
const phrase5 = "papa quebec romeo";

const phrase6 = "sierra tango uniform";

const values: readonly string[] = [
    phrase0,
    phrase1,
    phrase2,
    phrase3,
    phrase4,
    phrase5,
    phrase6,
];

const split0 = values[0]!.split(" ");
const split1 = values[1]!.split(" ");
const split2 = values[2]!.split(" ");
const split3 = values[3]!.split(" ");
const split4 = values[4]!.split(" ");
const split5 = values[5]!.split(" ");
const split6 = values[6]!.split(" ");

export const stringSplitStressFixture: string = [
    ...split0,
    ...split1,
    ...split2,
    ...split3,
    ...split4,
    ...split5,
    ...split6,
].join("|");
