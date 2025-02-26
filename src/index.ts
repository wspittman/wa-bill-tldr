import { aiService } from "./aiService/aiService";
import { billService } from "./billService/billService";
import type { BillDoc, BillFull, DocSummary } from "./billService/types";
import { markdownToHtml } from "./utils/html";
import { logger } from "./utils/logger";
import { wslWebService } from "./wslWebService/wslWebService";

const biennium = "2025-26";
const year = "2025";

async function main() {
  try {
    logHeader("WA-Bill-TLDR Update");

    logHeader("Outdated Bill Check");
    await billService.initialize();
    const outdatedIds = await getOutdatedIds();
    logger.info("Bills needing updates", outdatedIds);

    logHeader("Bill Updates");
    // Sequential execution with for...of (be kind to WSL's servers)
    for (const id of outdatedIds) {
      const bill = await updateBill(id);
      if (bill) {
        await summarizeBill(bill);
      }
    }
  } finally {
    logHeader("Saving Updated Bills");
    await billService.saveBills();
    aiService.logAggregation();
  }

  logHeader("WA-Bill-TLDR Update Complete");
}

async function getOutdatedIds(): Promise<number[]> {
  const unknownIds: number[] = [];
  const outdatedIds: number[] = [];
  let wslBills = await wslWebService.getLegislationMetaByYear(year);

  // Cut down during development
  wslBills = wslBills.slice(0, 10);

  logger.info("Bills to check", wslBills.length);

  // Sequential execution with for...of (be kind to WSL's servers)
  for (const { BillNumber: id } of wslBills) {
    const knownDate = billService.getLastUpdated(id);

    if (!knownDate) {
      logger.debug(`Unknown bill ${id}`);
      unknownIds.push(id);
    } else {
      const { ActionDate: actionDate } =
        await wslWebService.getLegislationStatus(biennium, id);

      if (actionDate > knownDate) {
        logger.debug(`Outdated bill ${id}`, knownDate);
        outdatedIds.push(id);
      }
    }
  }

  logger.info("Unknown bills", unknownIds);
  logger.info("Outdated bills", outdatedIds);

  return [...unknownIds, ...outdatedIds];
}

async function updateBill(id: number) {
  logger.info(`Updating bill ${id}`);
  const legislation = await wslWebService.getLegislation(biennium, id);
  const sponsors = await wslWebService.getSponsors(
    biennium,
    legislation[0].BillId
  );
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

  return billService.upsertBill(
    legislation,
    sponsors,
    billDoc,
    billRepDoc,
    amendmentsDoc
  );
}

async function summarizeBill(bill: BillFull) {
  logger.info(`Summarizing bill ${bill.id}`);
  const billSummary = await billService.getBillSummary(bill.id);

  await Promise.all([
    addSummaries(bill.billDocuments, billSummary.documents),
    //addSummaries(bill.billReports, billSummary.reports),
    //addSummaries(bill.billAmendments, billSummary.amendments),
  ]);

  await billService.saveBillSummary(billSummary);
}

async function addSummaries(
  documents: BillDoc[],
  docSummaries: Record<string, DocSummary>
) {
  for (const { createdDate, url, name } of documents) {
    const docSummary = docSummaries[name];
    if (!docSummary || createdDate > docSummary.createdDate) {
      const html = await (await fetch(url)).text();
      const summary = await aiService.summarize(html);
      if (summary) {
        const summaryHtml = markdownToHtml(summary);
        docSummaries[name] = {
          createdDate,
          original: html,
          summary: summaryHtml,
        };
      }
    }
  }
}

function logHeader(msg: string) {
  logger.info(`== ${msg} ==`);
}

main().catch(logger.error);
