import type { Constructor } from "type-fest";

interface QueueClient {
    enqueue(message: string): void;
}

type QueueClientConstructor = Constructor<QueueClient>;

type QueueClientAbstractConstructor = abstract new (
    queueName: string,
    retryCount: number
) => QueueClient;

declare const queueClientCtor: QueueClientConstructor;

type QueueClientFromCtor = InstanceType<QueueClientAbstractConstructor>;

String(queueClientCtor);
String({} as QueueClientFromCtor);

export const __typedFixtureModule = "typed-fixture-module";
