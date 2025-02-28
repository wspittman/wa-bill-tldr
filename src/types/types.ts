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
  status: TSString;

  // From Sponsors
  sponsors: string[];

  // Generated
  keywords?: TSString;
}

export interface BillFull extends Bill {
  // From Documents
  document: BillDoc;
  subDocuments: BillDoc[];
}

export interface BillDoc {
  name: string;
  description: string;
  url: TSString;
  original?: TSString;
  summary?: TSString;
}

export interface TSString {
  ts: string;
  text: string;
}
