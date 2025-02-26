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
} from "./billData";
import type { Bill, BillDoc, BillFull, BillSummary } from "./types";

class BillService {
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
    if (!legislation.length) return;

    // If multiple, get the earliest one
    const leg = legislation.reduce((a, b) =>
      a.IntroducedDate < b.IntroducedDate ? a : b
    );
    const id = leg.BillNumber;

    const bill: Bill = {
      id,
      lastUpdated: new Date().toISOString(),
      agency: leg.OriginalAgency,
      description: leg.LongDescription ?? "",
      introducedDate: leg.IntroducedDate.toISOString(),
      status: leg.CurrentStatus?.HistoryLine ?? "",
      actionDate: leg.CurrentStatus?.ActionDate.toISOString() ?? "",
      sponsors: sponsors.map((s) => s.Name ?? String(s.Id)),
    };

    const newBill: BillFull = {
      ...bill,
      billDocuments: documents.map(formBillDoc),
      billReports: billReports.map(formBillDoc),
      billAmendments: amendments.map(formBillDoc),
    };

    this.bills.set(id, bill);
    this.modified = true;
    await writeBillFull(id, newBill);

    return newBill;
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

function formBillDoc({
  Name: name = "",
  LongFriendlyName: description = "",
  HtmUrl: url = "",
  HtmCreateDate: createdDate,
}: LegislativeDocument): BillDoc {
  return {
    name,
    description,
    url,
    createdDate: createdDate.toISOString(),
  };
}
