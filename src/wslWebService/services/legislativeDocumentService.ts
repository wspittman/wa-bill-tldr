import * as soap from "soap";
import type { Biennium, LegislativeDocument } from "../types/models";

class LegislativeDocumentService {
  // TBD: Make pathing work
  private readonly wsdlPath =
    "src/wslWebService/wsdl/LegislativeDocumentService.wsdl";
  private client?: soap.Client = undefined;

  constructor() {}

  private async ensureClient(): Promise<soap.Client> {
    if (!this.client) {
      this.client = await soap.createClientAsync(this.wsdlPath);
    }
    return this.client;
  }

  async GetDocumentsByClass(
    biennium: string,
    documentClass: string,
    namedLike: string
  ): Promise<LegislativeDocument[]> {
    const client = await this.ensureClient();
    const [result] = await client.GetDocumentsByClassAsync({
      biennium,
      documentClass,
      namedLike,
    });
    return result.GetDocumentsByClassResult.LegislativeDocument || [];
  }

  async GetDocuments(
    biennium: string,
    namedLike: string
  ): Promise<LegislativeDocument[]> {
    const client = await this.ensureClient();
    const [result] = await client.GetDocumentsAsync({
      biennium,
      namedLike,
    });
    return result.GetDocumentsResult.LegislativeDocument || [];
  }

  async GetAllDocumentsByClass(
    biennium: Biennium,
    documentClass: string
  ): Promise<LegislativeDocument[]> {
    const client = await this.ensureClient();
    const [result] = await client.GetAllDocumentsByClassAsync({
      biennium,
      documentClass,
    });
    return result?.GetAllDocumentsByClassResult?.LegislativeDocument || [];
  }

  async GetDocumentClasses(biennium: Biennium): Promise<string[]> {
    const client = await this.ensureClient();
    const [result] = await client.GetDocumentClassesAsync({ biennium });
    // The anyType makes this a bit awkward
    const awkwardArray = result?.GetDocumentClassesResult?.anyType || [];
    return awkwardArray.map((awkward: any) => String(awkward["$value"]));
  }
}

export const legislativeDocumentService = new LegislativeDocumentService();
