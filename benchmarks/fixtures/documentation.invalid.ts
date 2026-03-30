/**
 * Create a service identifier.
 */
export function createService(name: string): string {
    return `service:${name}`;
}

/**
 * Return a normalized service name.
 *
 * @returns Legacy alias for returns.
 */
export function normalizeName(name: string): string {
    return name.trim();
}

/**
 * Run a task by name.
 *
 * See {@link missing.Symbol}.
 */
export function runTask(taskName: string): void {
    console.info(taskName);
}
