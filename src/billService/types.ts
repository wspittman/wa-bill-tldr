import type { Agency } from "../wslWebService/types/models";

export interface Bill {
  id: number;
  lastUpdated: string;

  // From LegislationInfo
  agency: Agency;

  // From Legislation
  description: string;
  introducedDate: string;

  // From LegislativeStatus
  status: string;
  actionDate: string;

  // From Sponsors
  sponsors: {
    name: string;
    isPrimary?: boolean;
  }[];
}

export interface BillFull extends Bill {
  // From Documents
  billDocuments: {
    name: string;
    url: string;
    createdDate: string;
  }[];
  billReports: {
    name: string;
    url: string;
    createdDate: string;
  }[];
  billAmendments: {
    name: string;
    url: string;
    createdDate: string;
  }[];
}
