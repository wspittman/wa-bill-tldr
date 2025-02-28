import { aiService } from "./aiService/aiService";
import {
  readBills,
  readBillSummary,
  writeBillFull,
  writeBills,
  writeBillSummary,
} from "./bills/billStorage";
import type {
  Bill,
  BillDoc,
  BillFull,
  BillSummary,
  DocSummary,
} from "./bills/types";
import {
  getBillInfo,
  getLastActionDate,
  getLegislationIds,
} from "./bills/wslHelpers";
import { wslToBill, wslToBillFull } from "./bills/wslToBill";
import { asyncBatch } from "./utils/asyncBatch";
import { markdownToHtml } from "./utils/html";
import { logger } from "./utils/logger";

const billMap = new Map<number, Bill>();
let modified = false;

export async function initialize() {
  logHeader("WA-Bill-TLDR Initialize");
  const bills = await readBills();
  for (const bill of bills) {
    billMap.set(bill.id, bill);
  }
}

export async function finalize() {
  logHeader("Finalize");
  if (modified) {
    const bills = Array.from(billMap.values()).sort((a, b) => a.id - b.id);
    await writeBills(bills);
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
    const lastUpdated = billMap.get(id)?.lastUpdated;
    const knownDate = lastUpdated ? new Date(lastUpdated) : undefined;

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

  const bill = wslToBill(id, legislation, sponsors);

  if (!bill) return;

  const billFull = wslToBillFull(bill, billDoc, [], []);

  billMap.set(id, bill);
  modified = true;
  await writeBillFull(id, billFull);

  return billFull;
}

async function summarizeBill(bill: BillFull) {
  logger.info(`Summarizing bill ${bill.id}`);
  const billSummary = await getBillSummary(bill.id);

  await addSummaries(bill.id, bill.billDocuments, billSummary.documents);

  await writeBillSummary(billSummary.id, billSummary);
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

async function getBillSummary(id: number): Promise<BillSummary> {
  const summary = await readBillSummary(id);
  return (
    summary ?? {
      id,
      documents: {},
      reports: {},
      amendments: {},
    }
  );
}

function logHeader(msg: string) {
  logger.info(`== ${msg} ==`);
}
