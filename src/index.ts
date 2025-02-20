import { billService } from "./billService/billService";
import { wslWebService } from "./wslWebService/wslWebService";

const biennium = "2025-26";
const year = "2025";

async function main() {
  logHeader("WA-Bill-TLDR Update");

  logHeader("Outdated Bill Check");
  await billService.initialize();
  const outdatedIds = await getOutdatedIds();
  logArray("Bills needing updates", outdatedIds);

  logHeader("Bill Updates");
  // Sequential execution with for...of (be kind to WSL's servers)
  for (const id of outdatedIds) {
    await updateBill(id);
  }

  logHeader("Saving Updated Bills");
  await billService.save();

  logHeader("WA-Bill-TLDR Update Complete");
}

async function getOutdatedIds(): Promise<number[]> {
  const unknownIds: number[] = [];
  const outdatedIds: number[] = [];
  let wslBills = await wslWebService.getLegislationMetaByYear(year);

  // Cut down during development
  wslBills = wslBills.slice(0, 1);

  console.log("Bills to check:", wslBills.length);

  // Sequential execution with for...of (be kind to WSL's servers)
  for (const { BillNumber: id } of wslBills) {
    const knownDate = billService.getLastUpdated(id);

    if (!knownDate) {
      unknownIds.push(id);
    } else {
      const { ActionDate: actionDate } =
        await wslWebService.getLegislationStatus(biennium, id);

      if (actionDate > knownDate) {
        outdatedIds.push(id);
      }
    }
  }

  logArray("Unknown bills", unknownIds);
  logArray("Outdated bills", outdatedIds);

  return [...unknownIds, ...outdatedIds];
}

async function updateBill(id: number) {
  console.log(`Updating bill ${id}`);
  const bill = await wslWebService.getLegislation(biennium, id);
  const sponsors = await wslWebService.getSponsors(biennium, bill[0].BillId);
  const billDoc = await wslWebService.getDocuments(biennium, "Bills", id);
  const billRepDoc = await wslWebService.getDocuments(
    biennium,
    "Bill Reports",
    id
  );
  const amendmentsDoc = await wslWebService.getDocuments(
    biennium,
    "Amendments",
    id
  );

  billService.updateBill(bill, sponsors, billDoc, billRepDoc, amendmentsDoc);
}

function logHeader(msg: string) {
  console.log(`\n== ${msg} ==`);
}

function logArray(msg: string, arr: any[]) {
  console.log(`${msg}: `, arr.length > 10 ? arr.length : arr);
}

main().catch(console.error);
