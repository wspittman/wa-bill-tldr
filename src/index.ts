import { aiService } from "./aiService/aiService";
import { billService } from "./billService/billService";
import type { BillDoc, BillFull, DocSummary } from "./billService/types";
import { asyncBatch } from "./utils/asyncBatch";
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
    await asyncBatch("BillUpdate", outdatedIds, async (id) => {
      const bill = await updateBill(id);
      if (bill) {
        await summarizeBill(bill);
      }
    });
  } finally {
    logHeader("Saving Updated Bills");
    await billService.saveBills();
    aiService.logAggregation();
  }

  logHeader("WA-Bill-TLDR Update Complete");
}

async function getOutdatedIds(): Promise<number[]> {
  const unknownIds = new Set<number>();
  const outdatedIds = new Set<number>();
  let wslBills = await wslWebService.getLegislationMetaByYear(year);

  // Cut down during development
  wslBills = wslBills.slice(0, 30);

  logger.info("Bills to check", wslBills.length);

  // Sequential execution with for...of (be kind to WSL's servers)
  for (const { BillNumber: id } of wslBills) {
    // Sometimes there are duplicates for reasons I don't understand
    // eg. "HB 1015" vs "SHB 1015"
    if (unknownIds.has(id) || outdatedIds.has(id)) continue;

    const knownDate = billService.getLastUpdated(id);

    if (!knownDate) {
      logger.debug(`Unknown bill ${id}`);
      unknownIds.add(id);
    } else {
      const { ActionDate: actionDate } =
        await wslWebService.getLegislationStatus(biennium, id);

      if (actionDate > knownDate) {
        logger.debug(`Outdated bill ${id}`, knownDate);
        outdatedIds.add(id);
      }
    }
  }

  const unknownIdAr = Array.from(unknownIds);
  const outdatedIdAr = Array.from(outdatedIds);
  logger.info("Unknown bills", unknownIdAr);
  logger.info("Outdated bills", outdatedIdAr);

  return [...unknownIdAr, ...outdatedIdAr];
}

async function updateBill(id: number) {
  logger.info(`Updating bill ${id}`);
  const legislation = await wslWebService.getLegislation(biennium, id);
  const sponsors = await wslWebService.getSponsors(
    biennium,
    legislation[0].BillId
  );
  const billDoc = await wslWebService.getDocuments(biennium, "Bills", id);

  // Ignore bill reports and amendments for now
  /*const billRepDoc = await wslWebService.getDocuments(
    biennium,
    "Bill Reports",
    id
  );
  const amendmentsDoc = await wslWebService.getDocuments(
    biennium,
    "Amendments",
    id
  );*/

  return billService.upsertBill(
    legislation,
    sponsors,
    billDoc,
    [], //billRepDoc,
    [] //amendmentsDoc
  );
}

async function summarizeBill(bill: BillFull) {
  logger.info(`Summarizing bill ${bill.id}`);
  const billSummary = await billService.getBillSummary(bill.id);

  await Promise.all([
    addSummaries(bill.id, bill.billDocuments, billSummary.documents),
    //addSummaries(bill.billReports, billSummary.reports),
    //addSummaries(bill.billAmendments, billSummary.amendments),
  ]);

  await billService.saveBillSummary(billSummary);
}

async function addSummaries(
  id: number,
  documents: BillDoc[],
  docSummaries: Record<string, DocSummary>
) {
  const idString = String(id);

  const primary = documents.find((doc) => doc.name === idString);

  if (primary) {
    await addSummary(docSummaries, primary, (html) =>
      aiService.summarize(html)
    );

    const original = docSummaries[primary.name].original;

    for (const doc of documents) {
      if (doc.name !== primary.name) {
        await addSummary(docSummaries, doc, (html) =>
          aiService.compare(html, original)
        );
      }
    }
  }
}

async function addSummary(
  docSummaries: Record<string, DocSummary>,
  { createdDate, url, name }: BillDoc,
  fn: (html: string) => Promise<string | undefined>
) {
  const docSummary = docSummaries[name];
  if (!docSummary || createdDate > docSummary.createdDate) {
    const html = await (await fetch(url)).text();
    const summary = await fn(html);

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

function logHeader(msg: string) {
  logger.info(`== ${msg} ==`);
}

main().catch(logger.error);
