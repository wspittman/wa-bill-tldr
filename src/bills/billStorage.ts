import { readJsonFile, writeJsonFile } from "../utils/file";
import type { Bill, BillFull, BillSummary } from "./types";

const DATA_DIR = ["docs", "data"];
const BILLS_PATH = [...DATA_DIR, "bills.json"];
const billPath = (id: number) => [...DATA_DIR, `${id}.json`];
const summaryPath = (id: number) => [...DATA_DIR, `${id}_Summary.json`];

export async function readBills(): Promise<Bill[]> {
  const bills = await readJsonFile<Bill[]>(BILLS_PATH);
  return bills ?? [];
}

export async function writeBills(bills: Bill[]): Promise<void> {
  return writeJsonFile(bills, BILLS_PATH);
}

export async function readBillFull(id: number): Promise<BillFull | undefined> {
  return readJsonFile<BillFull>(billPath(id));
}

export async function writeBillFull(id: number, bill: BillFull): Promise<void> {
  return writeJsonFile(bill, billPath(id));
}

export async function readBillSummary(
  id: number
): Promise<BillSummary | undefined> {
  return readJsonFile<BillSummary>(summaryPath(id));
}

export async function writeBillSummary(
  id: number,
  summary: BillSummary
): Promise<void> {
  return writeJsonFile(summary, summaryPath(id));
}
