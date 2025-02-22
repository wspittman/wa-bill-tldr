import type {
  Legislation,
  LegislativeDocument,
  Sponsor,
} from "../wslWebService/types/models";
import { getBills, setBill, setBills } from "./billData";
import type { Bill, BillDoc, BillFull } from "./types";

class BillService {
  private bills: Map<number, Bill> = new Map();
  private fullBillCache: Map<number, BillFull> = new Map();
  private modified: boolean = false;
  private initialized: boolean = false;

  constructor() {}

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const bills = await getBills();
    this.bills = new Map(bills.map((bill) => [bill.id, bill]));
    this.initialized = true;
  }

  getLastUpdated(id: number): Date | undefined {
    if (!this.initialized) throw new Error("Service not initialized");
    const bill = this.bills.get(id);
    return bill ? new Date(bill.lastUpdated) : undefined;
  }

  async updateBill(
    legislation: Legislation[],
    sponsors: Sponsor[],
    documents: LegislativeDocument[],
    billReports: LegislativeDocument[],
    amendments: LegislativeDocument[]
  ): Promise<void> {
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
      status: leg.CurrentStatus?.Status ?? "",
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
    this.fullBillCache.set(id, newBill);
    this.modified = true;
    return setBill(id, newBill);
  }

  async save(): Promise<void> {
    if (!this.initialized) throw new Error("Service not initialized");
    if (!this.modified) return;

    const bills = Array.from(this.bills.values());
    await setBills(bills);

    this.modified = false;
  }
}

export const billService = new BillService();

function formBillDoc({
  Name: name = "",
  HtmUrl: url = "",
  HtmCreateDate: createdDate,
}: LegislativeDocument): BillDoc {
  return {
    name,
    url,
    createdDate: createdDate.toISOString(),
  };
}
