import type {
  Legislation,
  LegislativeDocument,
  Sponsor,
} from "../wslWebService/types/models";
import { getBills, setBill, setBills } from "./billData";
import type { Bill, BillDoc, BillFull, BillSponsor } from "./types";

class BillService {
  private bills: Map<number, Bill>;
  private modified: boolean;
  private fullBills: Map<number, BillFull>;
  private modifiedFullBills: Set<number>;
  private initialized: boolean;

  constructor() {
    this.bills = new Map();
    this.modified = false;
    this.fullBills = new Map();
    this.modifiedFullBills = new Set();
    this.initialized = false;
  }

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

  updateBill(
    legislation: Legislation[],
    sponsors: Sponsor[],
    documents: LegislativeDocument[],
    billReports: LegislativeDocument[],
    amendments: LegislativeDocument[]
  ): void {
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
      sponsors: sponsors.map(formBillSponsor),
    };

    const newBill: BillFull = {
      ...bill,
      billDocuments: documents.map(formBillDoc),
      billReports: billReports.map(formBillDoc),
      billAmendments: amendments.map(formBillDoc),
    };

    this.bills.set(id, bill);
    this.fullBills.set(id, newBill);
    this.modifiedFullBills.add(id);
    this.modified = true;
  }

  async save(): Promise<void> {
    if (!this.initialized) throw new Error("Service not initialized");
    if (!this.modified) return;

    const bills = Array.from(this.bills.values());
    await setBills(bills);

    for (const id of this.modifiedFullBills.keys()) {
      const fullBill = this.fullBills.get(id);
      if (fullBill) {
        await setBill(id, fullBill);
      }
    }

    this.modified = false;
    this.modifiedFullBills.clear();
  }
}

export const billService = new BillService();

function formBillSponsor({
  Name: name = "",
  Type: type,
}: Sponsor): BillSponsor {
  const result: BillSponsor = { name };
  if (type === "Primary") result.isPrimary = true;
  return result;
}

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
