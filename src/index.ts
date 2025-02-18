import * as soap from "soap";

const wsdlUrl =
  "https://wslwebservices.leg.wa.gov/LegislativeDocumentService.asmx?wsdl";

async function getDocumentsByClass(
  biennium: string,
  documentClass: string,
  namedLike: string
) {
  try {
    // Create a SOAP client
    const client = await soap.createClientAsync(wsdlUrl);

    // Define the request parameters
    const args = { biennium, documentClass, namedLike };

    console.dir(args, { depth: null });
    console.dir(client.describe(), { depth: null });

    // Call the SOAP method
    //const [result] = await client.GetDocumentClassesAsync(args);
    //const [result] = await client.GetDocumentsAsync(args);
    const [result] = await client.GetDocumentsByClassAsync(args);

    console.dir(result, { depth: null });
  } catch (error) {
    console.error("Error calling SOAP API:", error);
  }
}

// Example usage
getDocumentsByClass("2025-26", "Bills", "1215");
