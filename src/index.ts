import { wslWebService } from "./wslWebService/wslWebService";

async function temp() {
  const docs = await wslWebService.getDocuments("2025-26", "Bills", "1215");
  console.dir(docs, { depth: null });
}

temp();
