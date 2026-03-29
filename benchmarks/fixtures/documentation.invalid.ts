export function createService(name: string): string {
    return `service:${name}`;
}

/**
 * @returns Legacy alias for returns.
 */
export function normalizeName(name: string): string {
    return name.trim();
}

/**
 * See {@link}.
 */
export function runTask(taskName: string): void {
    console.info(taskName);
}
