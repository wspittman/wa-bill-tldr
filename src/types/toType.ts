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
    status: {
      ts: leg.CurrentStatus?.ActionDate.toISOString() ?? "",
      text: leg.CurrentStatus?.HistoryLine ?? "",
    },
    sponsors: sponsors.map((s) => s.Name ?? String(s.Id)),
  };
}

export function toBillFull(
  bill: Bill,
  billDocuments: LegislativeDocument[]
): BillFull | undefined {
  const idString = String(bill.id);
  const primary = billDocuments.find((doc) => doc.Name === idString);
  const others = billDocuments.filter((doc) => doc.Name !== idString);

  if (!primary) return;

  return {
    ...bill,
    document: toBillDoc(primary),
    subDocuments: others.map(toBillDoc),
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
    url: { ts: createdDate.toISOString(), text: url },
  };
}

export function mergeBillDocs(
  { document, subDocuments }: BillFull,
  { document: oldDocument, subDocuments: oldSubDocuments }: BillFull
) {
  mergeBillDoc(document, oldDocument);
  for (const doc of subDocuments) {
    const oldDoc = oldSubDocuments.find(({ name }) => name === doc.name);
    if (oldDoc) {
      mergeBillDoc(doc, oldDoc);
    }
  }
}

function mergeBillDoc(base: BillDoc, { original, summary }: BillDoc) {
  base.original = original;
  base.summary = summary;
}
