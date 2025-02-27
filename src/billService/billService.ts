import type {
  Legislation,
  LegislativeDocument,
  Sponsor,
} from "../wslWebService/types/models";
import {
  readBills,
  readBillSummary,
  writeBillFull,
  writeBills,
  writeBillSummary,
} from "./billStorage";
import type { Bill, BillFull, BillSummary } from "./types";
import { wslToBill, wslToBillFull } from "./wslToBill";

export class BillService {
  private bills: Map<number, Bill> = new Map();
  private modified: boolean = false;
  private initialized: boolean = false;

  constructor() {}

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const bills = await readBills();
    this.bills = new Map(bills.map((bill) => [bill.id, bill]));
    this.initialized = true;
  }

  getLastUpdated(id: number): Date | undefined {
    if (!this.initialized) throw new Error("Service not initialized");
    const bill = this.bills.get(id);
    return bill ? new Date(bill.lastUpdated) : undefined;
  }

  async upsertBill(
    legislation: Legislation[],
    sponsors: Sponsor[],
    documents: LegislativeDocument[],
    billReports: LegislativeDocument[],
    amendments: LegislativeDocument[]
  ): Promise<BillFull | undefined> {
    if (!this.initialized) throw new Error("Service not initialized");

    const id = legislation[0].BillNumber;
    const bill = wslToBill(id, legislation, sponsors);

    if (!bill) return;

    const billFull = wslToBillFull(bill, documents, billReports, amendments);

    this.bills.set(id, bill);
    this.modified = true;
    await writeBillFull(id, billFull);

    return billFull;
  }

  async getBillSummary(id: number): Promise<BillSummary> {
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

  async saveBillSummary(billSummary: BillSummary): Promise<void> {
    return writeBillSummary(billSummary.id, billSummary);
  }

  async saveBills(): Promise<void> {
    if (!this.initialized) throw new Error("Service not initialized");
    if (!this.modified) return;

    const bills = Array.from(this.bills.values()).sort((a, b) => a.id - b.id);
    await writeBills(bills);

    this.modified = false;
  }
}

export const billService = new BillService();
