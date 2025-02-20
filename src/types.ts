import type { Agency } from "./wslWebService/types/models";

export interface Bill {
  id: number;
  lastUpdated: string;
  agency: Agency;
  status: string;
}
