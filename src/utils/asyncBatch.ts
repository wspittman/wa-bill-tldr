import { logger } from "./logger.ts";

/**
 * Processes an array of values in batches using an async function.
 * Handles errors gracefully and logs batch statistics.
 *
 * @param name - The name of the batch operation for logging
 * @param values - Array of values to process
 * @param fn - Async function to process each value
 * @param size - Maximum batch size for concurrent processing (default: 5)
 * @returns Promise that resolves when all batches are processed
 */
export async function asyncBatch<T>(
  name: string,
  values: T[],
  fn: (value: T) => Promise<void>,
  size = 5
): Promise<void> {
  if (!values.length) return;

  logger.debug(`Begin Batch ${name}`, values.length);

  for (let i = 0; i < values.length; i += size) {
    const batch = values.slice(i, i + size);
    const result = await Promise.allSettled(batch.map((value) => fn(value)));

    result.forEach((r, index) => {
      if (r.status === "rejected") {
        logger.error(`Batch_${name}: at values[${i + index}]: ${r.reason}`);
      }
    });
  }

  logger.debug(`End Batch ${name}`, values.length);
}
