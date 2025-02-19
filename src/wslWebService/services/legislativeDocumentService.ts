import type {
  Biennium,
  DocumentClass,
  LegislativeDocument,
} from "../types/models";
import { BaseService } from "./baseService";

class LegislativeDocumentService extends BaseService {
  protected readonly wsdlPath =
    "src/wslWebService/wsdl/LegislativeDocumentService.wsdl";

  async getDocumentsByClass(options: {
    biennium: Biennium;
    documentClass: DocumentClass;
    namedLike: string;
  }): Promise<LegislativeDocument[]> {
    const result = await this.soapCall("GetDocumentsByClass", options);
    return result?.LegislativeDocument || [];
  }

  async getDocuments(options: {
    biennium: Biennium;
    namedLike: string;
  }): Promise<LegislativeDocument[]> {
    const result = await this.soapCall("GetDocuments", options);
    return result?.LegislativeDocument || [];
  }

  async getAllDocumentsByClass(options: {
    biennium: Biennium;
    documentClass: DocumentClass;
  }): Promise<LegislativeDocument[]> {
    const result = await this.soapCall("GetAllDocumentsByClass", options);
    return result?.LegislativeDocument || [];
  }

  async getDocumentClasses(biennium: Biennium): Promise<DocumentClass[]> {
    const result = await this.soapCall("GetDocumentClasses", { biennium });
    const awkwardArray = result?.anyType || [];
    return awkwardArray.map((awkward: any) => String(awkward["$value"]));
  }
}

export const legislativeDocumentService = new LegislativeDocumentService();
