interface QueueClient {
    enqueue(message: string): void;
}

type QueueClientAbstractConstructor = abstract new (
    queueName: string,
    retryCount: number
) => QueueClient;

type QueueClientFromCtor = InstanceType<QueueClientAbstractConstructor>;

String({} as QueueClientFromCtor);

export const __typedFixtureModule = "typed-fixture-module";
