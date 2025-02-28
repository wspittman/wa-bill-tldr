import { aiService } from "./aiService/aiService";
import { Storage } from "./storage";
import { toBill, toBillFull } from "./types/toType";
import type { Bill, BillDoc, BillFull, DocSummary } from "./types/types";
import { asyncBatch } from "./utils/asyncBatch";
import { markdownToHtml } from "./utils/html";
import { logger } from "./utils/logger";
import {
  getBillInfo,
  getLastActionDate,
  getLegislationIds,
} from "./wslHelpers";

const billMap = new Map<number, Bill>();
let modified = false;

export async function initialize() {
  logHeader("WA-Bill-TLDR Initialize");
  const bills = await Storage.readBills();
  for (const bill of bills) {
    billMap.set(bill.id, bill);
  }
}

export async function finalize() {
  logHeader("Finalize");
  if (modified) {
    const bills = Array.from(billMap.values()).sort((a, b) => a.id - b.id);
    await Storage.writeBills(bills);
  }
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
    const knownDate = getKnownDate(id);

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
  const bill = toBill(id, legislation, sponsors);

  if (!bill) return;

  billMap.set(id, bill);
  modified = true;
  const billFull = toBillFull(bill, billDoc, [], []);
  await Storage.writeBillFull(billFull);

  return billFull;
}

async function summarizeBill(bill: BillFull) {
  logger.info(`Summarizing bill ${bill.id}`);
  const billSummary = await Storage.readBillSummary(bill.id);
  await addSummaries(bill.id, bill.billDocuments, billSummary.documents);
  await Storage.writeBillSummary(billSummary);
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

function getKnownDate(id: number) {
  const lastUpdated = billMap.get(id)?.lastUpdated;
  return lastUpdated ? new Date(lastUpdated) : undefined;
}

function logHeader(msg: string) {
  logger.info(`== ${msg} ==`);
}
