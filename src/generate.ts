import { aiService } from "./aiService/aiService";
import { BillService } from "./billService/billService";
import type { BillDoc, BillFull, DocSummary } from "./billService/types";
import {
  getBillInfo,
  getLastActionDate,
  getLegislationIds,
} from "./billService/wslHelpers";
import { asyncBatch } from "./utils/asyncBatch";
import { markdownToHtml } from "./utils/html";
import { logger } from "./utils/logger";

const billService = new BillService();

export async function initialize() {
  logHeader("WA-Bill-TLDR Initialize");
  return billService.initialize();
}

export async function finalize() {
  logHeader("Finalize");
  await billService.saveBills();
  aiService.logAggregation();
  logHeader("WA-Bill-TLDR Complete");
}

export async function findOutdatedIds(): Promise<number[]> {
  logHeader("Find Outdated Ids");
  const outdatedIds = [];

  let ids = await getLegislationIds();

  // Cut down during development
  ids = ids.slice(0, 120);

  logger.info("Bills to check", ids.length);

  // Sequential execution with for...of (be kind to WSL's servers)
  for (const id of ids) {
    const knownDate = billService.getLastUpdated(id);

    if (!knownDate) {
      logger.debug(`Unknown bill ${id}`);
      outdatedIds.push(id);
    } else {
      const actionDate = await getLastActionDate(id);

      if (actionDate > knownDate) {
        logger.debug(`Outdated bill ${id}`, knownDate);
        outdatedIds.push(id);
      }
    }
  }

  logger.info("Bills needing updates", outdatedIds);

  return outdatedIds;
}

export async function updateBills(ids: number[]) {
  logHeader("Update Bills");
  await asyncBatch("BillUpdate", ids, async (id) => {
    const bill = await updateBill(id);
    if (bill) {
      await summarizeBill(bill);
    }
  });
}

async function updateBill(id: number) {
  logger.info(`Updating bill ${id}`);
  const { legislation, sponsors, billDoc } = await getBillInfo(id);

  return billService.upsertBill(legislation, sponsors, billDoc, [], []);
}

async function summarizeBill(bill: BillFull) {
  logger.info(`Summarizing bill ${bill.id}`);
  const billSummary = await billService.getBillSummary(bill.id);

  await addSummaries(bill.id, bill.billDocuments, billSummary.documents);

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
