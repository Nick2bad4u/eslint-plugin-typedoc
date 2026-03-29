interface QueueClient {
    enqueue(message: string): void;
}

type QueueClientConstructor = new (
    queueName: string,
    retryCount: number
) => QueueClient;

type QueueClientFromCtor = InstanceType<QueueClientConstructor>;

String({} as QueueClientFromCtor);

export const __typedFixtureModule = "typed-fixture-module";
