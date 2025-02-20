import { promises as fs } from "fs";
import path from "path";
import type { Bill } from "./types";

const DATA_DIR = path.join(process.cwd(), "docs", "data");
const BILLS_FILE = path.join(DATA_DIR, "bills.json");
const billPath = (id: string) => path.join(DATA_DIR, `${id}.json`);

export async function getBills(): Promise<Bill[]> {
  const bills = await readJsonFile<Bill[]>(BILLS_FILE);
  return bills ?? [];
}

export async function setBills(bills: Bill[]): Promise<void> {
  return writeJsonFile(BILLS_FILE, bills);
}

export async function getBill(id: string): Promise<Bill | undefined> {
  return readJsonFile<Bill>(billPath(id));
}

export async function setBill(id: string, bill: Bill): Promise<void> {
  return writeJsonFile(billPath(id), bill);
}

async function readJsonFile<T>(filePath: string): Promise<T | undefined> {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data) as T;
  } catch (error) {
    return undefined;
  }
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}
