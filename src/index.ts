import { finalize, findOutdatedIds, initialize, updateBills } from "./generate";
import { logger } from "./utils/logger";

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
