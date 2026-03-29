export interface PublicApi {
    run(): void;
}

export class Client implements PublicApi {
    public run(): void {}
}

export const createService = (): PublicApi => new Client();

export function createWorker(name: string): { name: string } {
    return { name };
}
