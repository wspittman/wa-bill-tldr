import type {
  Legislation,
  LegislativeDocument,
  Sponsor,
} from "../wslWebService/types/models";
import type { Bill, BillDoc, BillFull } from "./types";

export function toBill(
  id: number,
  legislation: Legislation[],
  sponsors: Sponsor[]
): Bill | undefined {
  if (!legislation.length) return;

  // If multiple, get the earliest one
  const leg = legislation.reduce((a, b) =>
    a.IntroducedDate < b.IntroducedDate ? a : b
  );

  return {
    id,
    lastUpdated: new Date().toISOString(),
    agency: leg.OriginalAgency,
    description: leg.LongDescription ?? "",
    introducedDate: leg.IntroducedDate.toISOString(),
    status: leg.CurrentStatus?.HistoryLine ?? "",
    actionDate: leg.CurrentStatus?.ActionDate.toISOString() ?? "",
    sponsors: sponsors.map((s) => s.Name ?? String(s.Id)),
  };
}

export function toBillFull(
  bill: Bill,
  billDocuments: LegislativeDocument[],
  billReports: LegislativeDocument[],
  billAmendments: LegislativeDocument[]
): BillFull {
  return {
    ...bill,
    billDocuments: billDocuments.map(toBillDoc),
    billReports: billReports.map(toBillDoc),
    billAmendments: billAmendments.map(toBillDoc),
  };
}

function toBillDoc({
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

export function toBlankBillSummary(id: number) {
  return {
    id,
    documents: {},
    reports: {},
    amendments: {},
  };
}
