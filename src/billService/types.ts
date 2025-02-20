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
  sponsors: BillSponsor[];
}

export interface BillFull extends Bill {
  // From Documents
  billDocuments: BillDoc[];
  billReports: BillDoc[];
  billAmendments: BillDoc[];
}

export interface BillSponsor {
  name: string;
  isPrimary?: boolean;
}

export interface BillDoc {
  name: string;
  url: string;
  createdDate: string;
}
