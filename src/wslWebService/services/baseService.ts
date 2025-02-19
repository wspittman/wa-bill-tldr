import path from "path";
import * as soap from "soap";

const WSDL_DIR = path.join(process.cwd(), "src", "wslWebService", "wsdl");

export abstract class BaseService {
  protected abstract readonly wsdlFileName: string;
  private client?: soap.Client = undefined;

  protected get wsdlPath(): string {
    return path.join(WSDL_DIR, this.wsdlFileName);
  }

  protected async ensureClient(): Promise<soap.Client> {
    if (!this.client) {
      this.client = await soap.createClientAsync(this.wsdlPath);
    }
    return this.client;
  }

  protected async soapCall(
    methodName: string,
    args: Record<string, unknown>
  ): Promise<any> {
    const client = await this.ensureClient();
    const [result] = await client[`${methodName}Async`](args);
    return result?.[`${methodName}Result`];
  }
}
