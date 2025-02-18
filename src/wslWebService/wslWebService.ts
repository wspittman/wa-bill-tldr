import { legislativeDocumentService } from "./services/legislativeDocumentService";
import { Biennium } from "./types/models";

class WSLWebService {
  constructor() {}

  async getLegislation(biennium: Biennium, billNumber: string) {
    // TODO: Implement getting full bill text
    throw new Error("Not implemented");
  }

  async getLegislationMeta(biennium: Biennium, billNumber: string) {
    // TODO: Implement getting bill metadata
    throw new Error("Not implemented");
  }

  async getSponsors(biennium: Biennium, billNumber: string) {
    // TODO: Implement getting bill sponsors
    throw new Error("Not implemented");
  }

  async getDocClasses(biennium: Biennium) {
    return legislativeDocumentService.GetDocumentClasses(biennium);
  }

  async getDocuments(biennium: Biennium, billNumber: string) {
    return legislativeDocumentService.GetDocumentsByClass(
      biennium,
      "Bills",
      billNumber
    );
  }
}

export const wslWebService = new WSLWebService();
