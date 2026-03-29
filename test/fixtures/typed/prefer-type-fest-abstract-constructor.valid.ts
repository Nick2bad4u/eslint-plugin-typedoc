import type { AbstractConstructor } from "type-fest";

interface QueueClient {
    enqueue(message: string): void;
}

type QueueClientAbstractConstructor = AbstractConstructor<QueueClient>;

type QueueClientConcreteConstructor = new (
    queueName: string,
    retryCount: number
) => QueueClient;

declare const queueClientCtor: QueueClientAbstractConstructor;

type QueueClientFromCtor = InstanceType<QueueClientConcreteConstructor>;

String(queueClientCtor);
String({} as QueueClientFromCtor);

export const __typedFixtureModule = "typed-fixture-module";
