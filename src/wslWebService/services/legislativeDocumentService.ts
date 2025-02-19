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

  async getDocumentsByClass(options: {
    biennium: Biennium;
    documentClass: string;
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
    documentClass: string;
  }): Promise<LegislativeDocument[]> {
    const result = await this.soapCall("GetAllDocumentsByClass", options);
    return result?.LegislativeDocument || [];
  }

  async getDocumentClasses(biennium: Biennium): Promise<string[]> {
    const result = await this.soapCall("GetDocumentClasses", { biennium });
    const awkwardArray = result?.anyType || [];
    return awkwardArray.map((awkward: any) => String(awkward["$value"]));
  }

  private async soapCall(
    methodName: string,
    args: Record<string, unknown>
  ): Promise<any> {
    const client = await this.ensureClient();
    const [result] = await client[`${methodName}Async`](args);
    return result?.[`${methodName}Result`];
  }
}

export const legislativeDocumentService = new LegislativeDocumentService();
