import type { Bill, BillFull } from "./types/types";
import { readJsonFile, writeJsonFile } from "./utils/file";

const DATA_DIR = ["docs", "data"];
const BILLS_PATH = [...DATA_DIR, "bills.json"];
const billPath = (id: number) => [...DATA_DIR, `${id}.json`];
const summaryPath = (id: number) => [...DATA_DIR, `${id}_Summary.json`];

export class Storage {
  static async readBillMap(): Promise<Map<number, Bill>> {
    const bills = await readJsonFile<Bill[]>(BILLS_PATH);
    return bills ? new Map(bills.map((b) => [b.id, b])) : new Map();
  }

  static async readBillFull(id: number): Promise<BillFull | undefined> {
    return readJsonFile<BillFull>(billPath(id));
  }

  static async writeBillMap(billMap: Map<number, Bill>): Promise<void> {
    const bills = Array.from(billMap.values()).sort((a, b) => a.id - b.id);
    return writeJsonFile(bills, BILLS_PATH);
  }

  static async writeBillFull(billFull: BillFull): Promise<void> {
    return writeJsonFile(billFull, billPath(billFull.id));
  }
}
