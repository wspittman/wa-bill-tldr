import type {
  Legislation,
  LegislativeDocument,
  Sponsor,
} from "../wslWebService/types/models";
import { getBills, setBills } from "./billData";
import type { Bill } from "./types";

class BillManager {
  private bills: Map<number, Bill>;
  private initialized: boolean;

  constructor() {
    this.bills = new Map();
    this.initialized = false;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const bills = await getBills();
    this.bills = new Map(bills.map((bill) => [bill.id, bill]));
    this.initialized = true;
  }

  getLastUpdated(id: number): Date | undefined {
    const bill = this.bills.get(id);
    return bill ? new Date(bill.lastUpdated) : undefined;
  }

  updateBill(
    legislation: Legislation[],
    sponsors: Sponsor[],
    documents: LegislativeDocument[],
    billReports: LegislativeDocument[],
    amendments: LegislativeDocument[]
  ): void {
    // TBD
  }

  async save(): Promise<void> {
    const bills = Array.from(this.bills.values());
    return setBills(bills);
  }
}

export const billManager = new BillManager();
