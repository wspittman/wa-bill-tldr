import { getBills } from "./billData";
import type { Bill } from "./types";
import { wslWebService } from "./wslWebService/wslWebService";

const biennium = "2025-26";
const year = "2025";

async function main() {
  const knownBills = await getBills();
  const billsToUpdate = await findChangedBills(knownBills);
  console.log("Bills needing updates:", billsToUpdate);
}

async function findChangedBills(knownBills: Bill[]) {
  const toUpdate = new Set<number>();
  const wslBills = (await wslWebService.getLegislationMetaByYear(year)).slice(
    0,
    5
  );

  // Create map of known bills for faster lookup
  const lastUpdatedMap = new Map(
    knownBills.map(({ id, lastUpdated }) => [id, new Date(lastUpdated)])
  );

  // Check each current bill
  for (const { BillNumber } of wslBills) {
    const knownDate = lastUpdatedMap.get(BillNumber);

    if (!knownDate) {
      // Bill is not in our known list
      toUpdate.add(BillNumber);
    } else {
      // Check if bill status has been updated
      const { ActionDate } = await wslWebService.getLegislationStatus(
        biennium,
        BillNumber
      );

      if (ActionDate > knownDate) {
        toUpdate.add(BillNumber);
      }
    }
  }

  return toUpdate;
}

main().catch(console.error);
