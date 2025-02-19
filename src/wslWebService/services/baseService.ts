import * as soap from "soap";

export abstract class BaseService {
  protected abstract readonly wsdlPath: string;
  private client?: soap.Client = undefined;

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
