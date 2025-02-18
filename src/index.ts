import { wslWebService } from "./wslWebService/wslWebService";

// Example usage
//getDocumentsByClass("2025-26", "Bills", "1215");

wslWebService
  .getDocClasses("2027-28")
  .then((docClasses) => {
    console.log("Document classes:", docClasses);
  })
  .catch((error) => {
    console.error("Error fetching document classes:", error);
  });
