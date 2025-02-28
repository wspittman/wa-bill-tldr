import type { Agency } from "../wslWebService/types/models";

export interface Bill {
  id: number;
  lastUpdated: string;

  // From LegislationInfo section of Legislation
  agency: Agency;

  // From Legislation
  description: string;
  introducedDate: string;

  // From LegislativeStatus section of Legislation
  status: string;
  actionDate: string;

  // From Sponsors
  sponsors: string[];
}

export interface BillFull extends Bill {
  // From Documents
  billDocuments: BillDoc[];
  billReports: BillDoc[];
  billAmendments: BillDoc[];
}

export interface BillDoc {
  name: string;
  description: string;
  url: string;
  createdDate: string;
}

export interface BillSummary {
  id: number;
  documents: Record<string, DocSummary>;
  reports: Record<string, DocSummary>;
  amendments: Record<string, DocSummary>;
}

export interface DocSummary {
  createdDate: string;
  original: string;
  summary: string;
}
