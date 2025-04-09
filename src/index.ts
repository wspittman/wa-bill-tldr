import { setAsyncLogging } from "@dry-utils/async";
import { logger } from "@dry-utils/logger";
import {
  finalize,
  findOutdatedIds,
  initialize,
  updateBills,
} from "./generate.ts";

setAsyncLogging({
  logFn: logger.debug.bind(logger),
  errorFn: logger.error.bind(logger),
});

async function main() {
  try {
    initialize();
    const outdatedIds = await findOutdatedIds();
    await updateBills(outdatedIds);
  } finally {
    finalize();
  }
}

main().catch((err) => logger.error("Crash", err));
