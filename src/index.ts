import { wslWebService } from "./wslWebService/wslWebService";

// Example usage
//getDocumentsByClass("2025-26", "Bills", "1215");

/*wslWebService
  .getDocClasses("2025-26")
  .then((docClasses) => {
    console.log("Document classes:", docClasses);
  })
  .catch((error) => {
    console.error("Error fetching document classes:", error);
  });
*/

async function temp() {
  const docs = await wslWebService.getDocuments("2025-26", "Bills", "1215");
  console.dir(docs, { depth: null });

  const docs2 = await wslWebService.getDocuments("2025-26", "Initiatives");
  console.dir(docs2, { depth: null });

  const docs3 = await wslWebService.getDocuments("2027-28");
  console.dir(docs3, { depth: null });
}

temp();
