interface Payload {
    id: number;
    label: string;
}

const string0 = "alpha";
const string1 = "bravo";
const string2 = "charlie";
const string3 = "delta";
const string4 = "echo";
const string5 = "foxtrot";

const number0 = 0;
const number1 = 1;
const number2 = 2;
const number3 = 3;
const number4 = 4;
const number5 = 5;

const payload0 = { id: 0, label: "alpha" };
const payload1 = { id: 1, label: "bravo" };
const payload2 = { id: 2, label: "charlie" };
const payload3 = { id: 3, label: "delta" };
const payload4 = { id: 4, label: "echo" };
const payload5 = { id: 5, label: "foxtrot" };

const castString0 = string0 as string;
const castString1 = string1 as string;
const castString2 = string2 as string;
const castString3 = string3 as string;
const castString4 = string4 as string;
const castString5 = string5 as string;

const castNumber0 = number0 as number;
const castNumber1 = number1 as number;
const castNumber2 = number2 as number;
const castNumber3 = number3 as number;
const castNumber4 = number4 as number;
const castNumber5 = number5 as number;

const castPayload0 = payload0 as Payload;
const castPayload1 = payload1 as Payload;
const castPayload2 = payload2 as Payload;
const castPayload3 = payload3 as Payload;
const castPayload4 = payload4 as Payload;
const castPayload5 = payload5 as Payload;

const castTuple0 = [number0, string0] as readonly [number, string];
const castTuple1 = [number1, string1] as readonly [number, string];
const castTuple2 = [number2, string2] as readonly [number, string];
const castTuple3 = [number3, string3] as readonly [number, string];
const castTuple4 = [number4, string4] as readonly [number, string];
const castTuple5 = [number5, string5] as readonly [number, string];

const castRecord0 = ({ value: string0 } as { value: string }).value;
const castRecord1 = ({ value: string1 } as { value: string }).value;
const castRecord2 = ({ value: string2 } as { value: string }).value;
const castRecord3 = ({ value: string3 } as { value: string }).value;
const castRecord4 = ({ value: string4 } as { value: string }).value;
const castRecord5 = ({ value: string5 } as { value: string }).value;

export const safeCastToStressFixture: string = [
    castString0,
    castString1,
    castString2,
    castString3,
    castString4,
    castString5,
    String(castNumber0),
    String(castNumber1),
    String(castNumber2),
    String(castNumber3),
    String(castNumber4),
    String(castNumber5),
    castPayload0.label,
    castPayload1.label,
    castPayload2.label,
    castPayload3.label,
    castPayload4.label,
    castPayload5.label,
    String(castTuple0[0]),
    String(castTuple1[0]),
    String(castTuple2[0]),
    String(castTuple3[0]),
    String(castTuple4[0]),
    String(castTuple5[0]),
    castRecord0,
    castRecord1,
    castRecord2,
    castRecord3,
    castRecord4,
    castRecord5,
].join("|");
