type Payload = {
    id: number;
    name: string;
};

const nameLiteral = "Alice";
const nameValue = nameLiteral as string;

const numberLiteral = 42;
const numberValue = <number>numberLiteral;

const payloadLiteral = {
    id: 1,
    name: "alpha",
};
const payloadValue = payloadLiteral as Payload;

String(nameValue);
String(numberValue);
String(payloadValue);

export const __typedFixtureModule = "typed-fixture-module";
