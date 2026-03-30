/**
 * Create a service id.
 *
 * @param name - Service name.
 *
 * @returns Stable service identifier.
 */
export function createService(name: string): string {
    return `service:${name}`;
}

/**
 * Normalize service display names.
 *
 * @param name - Raw service name.
 *
 * @returns Normalized service name.
 */
export function normalizeName(name: string): string {
    return name.trim();
}

/**
 * Run a task by name.
 *
 * @remarks
 * See {@link normalizeName|normalizeName}.
 *
 * @param taskName - Task name.
 */
export function runTask(taskName: string): void {
    console.info(taskName);
}
