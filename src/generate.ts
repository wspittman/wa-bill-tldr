import { aiService } from "./aiService/aiService";
import { Storage } from "./storage";
import { mergeBillDocs, toBill, toBillFull } from "./types/toType";
import type { Bill, BillFull, TSString } from "./types/types";
import { asyncBatch } from "./utils/asyncBatch";
import { markdownToHtml } from "./utils/html";
import { logger } from "./utils/logger";
import {
  getBillDocInfo,
  getBillInfo,
  getLastActionDate,
  getLegislationIds,
} from "./wslHelpers";

const LIMIT = 60;
let billMap = new Map<number, Bill>();
let modified = false;

export async function initialize(): Promise<void> {
  logHeader("WA-Bill-TLDR Initialize");
  billMap = await Storage.readBillMap();
}

export async function finalize(): Promise<void> {
  logHeader("Finalize");
  if (modified) {
    await Storage.writeBillMap(billMap);
  }
  aiService.logAggregation();
  logHeader("WA-Bill-TLDR Complete");
}

export async function findOutdatedIds(): Promise<number[]> {
  logHeader("Find Outdated Ids");
  const outdatedIds = [];

  let ids = await getLegislationIds();

  // Cut down during development
  if (LIMIT) {
    ids = ids.slice(0, LIMIT);
  }

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

export async function updateBills(ids: number[]): Promise<void> {
  logHeader("Update Bills");
  await asyncBatch("BillUpdate", ids, async (id) => {
    const bill = await updateBill(id);
    if (!bill) return;

    const billFull = await updateBillFull(bill);
    if (!billFull) return;

    await updateOriginalTexts(billFull);
    await updateDocumentSummary(billFull);
    await updateSubDocumentsSummary(billFull);
    await updateKeywords(billFull);
    bill.keywords = billFull.keywords;

    await Storage.writeBillFull(billFull);
  });
}

async function updateBill(id: number): Promise<Bill | undefined> {
  logger.info(`Updating bill ${id}`);
  const { legislation, sponsors } = await getBillInfo(id);
  const bill = toBill(id, legislation, sponsors);

  if (bill) {
    billMap.set(id, bill);
    modified = true;
  }

  return bill;
}

async function updateBillFull(bill: Bill): Promise<BillFull | undefined> {
  logger.info(`Updating bill full ${bill.id}`);

  const docs = await getBillDocInfo(bill.id);
  const billFull = toBillFull(bill, docs);

  if (billFull) {
    const oldBillFull = await Storage.readBillFull(bill.id);
    if (oldBillFull) {
      mergeBillDocs(billFull, oldBillFull);
      billFull.keywords = oldBillFull.keywords;
    }
  }

  return billFull;
}

async function updateOriginalTexts({
  id,
  document,
  subDocuments,
}: BillFull): Promise<void> {
  logger.info(`Updating original texts ${id}`);
  const docs = [document, ...subDocuments];

  for (const doc of docs) {
    const { url, original } = doc;
    doc.original = await createTSString(url, original, async (x) =>
      (await fetch(x)).text()
    );
  }
}

async function updateDocumentSummary({
  id,
  document,
}: BillFull): Promise<void> {
  logger.info(`Updating document summary ${id}`);
  const { original, summary } = document;
  document.summary = await createTSString(original, summary, async (x) =>
    markdownToHtml((await aiService.summarize(x)) ?? "")
  );
}

async function updateSubDocumentsSummary({
  id,
  document,
  subDocuments,
}: BillFull): Promise<void> {
  logger.info(`Updating subDocument summary ${id}`);
  const documentHtml = document.original?.text;
  if (!documentHtml) return;

  for (const doc of subDocuments) {
    const { original, summary } = doc;
    doc.summary = await createTSString(original, summary, async (x) =>
      markdownToHtml((await aiService.compare(x, documentHtml)) ?? "")
    );
  }
}

async function updateKeywords(bill: BillFull): Promise<void> {
  logger.info(`Updating keywords ${bill.id}`);
  const { summary } = bill.document;

  if (!summary) return;

  bill.keywords = await createTSString(summary, bill.keywords, async (x) =>
    aiService.extractKeywords(x, bill.description)
  );
}

async function createTSString(
  prime?: TSString,
  derivative?: TSString,
  fn?: (primeContent: string) => Promise<string | undefined>
): Promise<TSString | undefined> {
  if (requireUpdate(prime, derivative) && fn) {
    const derivativeContent = await fn(prime!.text);
    if (derivativeContent) {
      return {
        ts: prime!.ts,
        text: derivativeContent,
      };
    }
  }

  return derivative;
}

function requireUpdate(prime?: TSString, derivative?: TSString) {
  return prime && (!derivative || derivative.ts < prime.ts);
}

function getKnownDate(id: number) {
  const lastUpdated = billMap.get(id)?.lastUpdated;
  return lastUpdated ? new Date(lastUpdated) : undefined;
}

function logHeader(msg: string) {
  logger.info(`== ${msg} ==`);
}
