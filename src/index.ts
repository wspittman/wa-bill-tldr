import { getBills } from "./billData";
import { wslWebService } from "./wslWebService/wslWebService";

const biennium = "2025-26";

async function main() {
  const billData = await getBills();
  console.dir(billData, { depth: null });
}

async function findChangedBills() {
  ///const bills = await wslWebService.getLegislationMeta(biennium);
}

async function temp() {
  const docs = await wslWebService.getDocuments("2025-26", "Bills", "1215");
  console.dir(docs, { depth: null });
}

//temp();

main().catch(console.error);
