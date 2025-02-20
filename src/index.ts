import { billService } from "./billService/billService";
import { wslWebService } from "./wslWebService/wslWebService";

const biennium = "2025-26";
const year = "2025";

async function main() {
  await billService.initialize();
  const billsToUpdate = await findChangedBills();
  console.log("Bills needing updates:", billsToUpdate);
  billsToUpdate.forEach(updateBill);
}

async function findChangedBills() {
  const toUpdate = new Set<number>();
  const wslBills = (await wslWebService.getLegislationMetaByYear(year)).slice(
    0,
    2
  );
  //const wslBills = [{ BillNumber: 1550 }];

  // Check each current bill
  for (const { BillNumber } of wslBills) {
    const knownDate = billService.getLastUpdated(BillNumber);

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

async function updateBill(billNumber: number) {
  // This might be multiple: original, senate version, v2, etc.
  // agency and description should be the same, take the earliest introduced date
  const bill = await wslWebService.getLegislation(biennium, billNumber);
  console.dir(bill, { depth: null });
  const sponsors = await wslWebService.getSponsors(biennium, bill[0].BillId!);
  console.dir(sponsors, { depth: null });

  // For now, just start with the one with ShortFriendlyName === "Original Bill"
  // There are a bunch and things move through the system
  const billDoc = await wslWebService.getDocuments(
    biennium,
    "Bills",
    billNumber
  );
  console.dir(billDoc, { depth: null });

  const billRepDoc = await wslWebService.getDocuments(
    biennium,
    "Bill Reports",
    billNumber
  );
  console.dir(billRepDoc, { depth: null });

  const amendmentsDoc = await wslWebService.getDocuments(
    biennium,
    "Amendments",
    billNumber
  );
  console.dir(amendmentsDoc, { depth: null });
}

main().catch(console.error);
