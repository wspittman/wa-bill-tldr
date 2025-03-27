import {
  finalize,
  findOutdatedIds,
  initialize,
  updateBills,
} from "./generate.ts";
import { logger } from "./utils/logger.ts";

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
