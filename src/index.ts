import { logger } from "dry-utils/logger";
import { finalize, findOutdatedIds, initialize, updateBills } from "./generate";

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
