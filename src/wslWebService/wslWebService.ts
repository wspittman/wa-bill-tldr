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

  async getDocumentClasses(biennium: Biennium) {
    return legislativeDocumentService.getDocumentClasses(biennium);
  }

  async getDocuments(
    biennium: Biennium,
    documentClass?: string,
    namedLike?: string
  ) {
    if (documentClass && namedLike) {
      return legislativeDocumentService.getDocumentsByClass({
        biennium,
        documentClass,
        namedLike,
      });
    }

    if (documentClass) {
      return legislativeDocumentService.getAllDocumentsByClass({
        biennium,
        documentClass,
      });
    }

    if (namedLike) {
      return legislativeDocumentService.getDocuments({
        biennium,
        namedLike,
      });
    }

    throw new Error("Must provide either documentClass or namedLike");
  }
}

export const wslWebService = new WSLWebService();
