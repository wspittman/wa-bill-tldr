import { toBlankBillSummary } from "./types/toType";
import type { Bill, BillFull, BillSummary } from "./types/types";
import { readJsonFile, writeJsonFile } from "./utils/file";

const DATA_DIR = ["docs", "data"];
const BILLS_PATH = [...DATA_DIR, "bills.json"];
const billPath = (id: number) => [...DATA_DIR, `${id}.json`];
const summaryPath = (id: number) => [...DATA_DIR, `${id}_Summary.json`];

export class Storage {
  static async readBills(): Promise<Bill[]> {
    const bills = await readJsonFile<Bill[]>(BILLS_PATH);
    return bills ?? [];
  }

  static async readBillSummary(id: number): Promise<BillSummary> {
    const billSummary = await readJsonFile<BillSummary>(summaryPath(id));
    return billSummary ?? toBlankBillSummary(id);
  }

  static async writeBills(bills: Bill[]): Promise<void> {
    return writeJsonFile(bills, BILLS_PATH);
  }

  static async writeBillFull(billFull: BillFull): Promise<void> {
    return writeJsonFile(billFull, billPath(billFull.id));
  }

  static async writeBillSummary(billSummary: BillSummary): Promise<void> {
    return writeJsonFile(billSummary, summaryPath(billSummary.id));
  }
}
