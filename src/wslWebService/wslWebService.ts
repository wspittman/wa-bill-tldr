import { legislationService } from "./services/legislationService.ts";
import { legislativeDocumentService } from "./services/legislativeDocumentService.ts";
import type {
  Agency,
  Biennium,
  DocumentClass,
  Legislation,
  LegislationInfo,
  LegislativeDocument,
  LegislativeStatus,
  Sponsor,
} from "./types/models.ts";

type BillStatus =
  | "Passed"
  | "PassedHouse"
  | "PassedSenate"
  | "Signed"
  | "Veto"
  | "VetoPartial";

class WSLWebService {
  constructor() {}

  async getLegislationMetaByYear(year: string): Promise<LegislationInfo[]> {
    return legislationService.getLegislationByYear(year);
  }

  async getLegislationMetaByStatus(
    biennium: Biennium,
    billStatus: BillStatus,
    agency?: Agency
  ): Promise<LegislationInfo[]> {
    if (!agency) {
      if (billStatus === "Passed") {
        return legislationService.getLegislationPassedLegislature(biennium);
      } else if (billStatus === "PassedHouse") {
        return legislationService.getLegislationPassedHouse(biennium);
      } else if (billStatus === "PassedSenate") {
        return legislationService.getLegislationPassedSenate(biennium);
      } else {
        throw new Error(
          `Invalid Parameter Combination: billStatus=${billStatus}, agency=${agency}`
        );
      }
    }

    if (billStatus === "PassedHouse") {
      return agency === "House"
        ? legislationService.getHouseLegislationPassedHouse(biennium)
        : legislationService.getSenateLegislationPassedHouse(biennium);
    }

    if (billStatus === "PassedSenate") {
      return agency === "House"
        ? legislationService.getHouseLegislationPassedSenate(biennium)
        : legislationService.getSenateLegislationPassedSenate(biennium);
    }

    if (billStatus === "Signed") {
      return legislationService.getLegislationGovernorSigned({
        biennium,
        agency,
      });
    }

    if (billStatus === "Veto") {
      return legislationService.getLegislationGovernorVeto({
        biennium,
        agency,
      });
    }

    if (billStatus === "VetoPartial") {
      return legislationService.getLegislationGovernorPartialVeto({
        biennium,
        agency,
      });
    }

    throw new Error(
      `Invalid Parameter Combination: billStatus=${billStatus}, agency=${agency}`
    );
  }

  async getLegislationMetaByRange(
    billStatus: Extract<BillStatus, "Passed" | "PassedHouse" | "PassedSenate">,
    beginDate: string,
    endDate: string
  ): Promise<LegislationInfo[]> {
    if (billStatus === "Passed") {
      return legislationService.getLegislationPassedLegislatureWithinTimeFrame({
        beginDate,
        endDate,
      });
    } else if (billStatus === "PassedHouse") {
      return legislationService.getLegislationPassedHouseWithinTimeFrame({
        beginDate,
        endDate,
      });
    } else if (billStatus === "PassedSenate") {
      return legislationService.getLegislationPassedSenateWithinTimeFrame({
        beginDate,
        endDate,
      });
    }

    throw new Error("Invalid Request");
  }

  async getLegislationStatus(
    biennium: Biennium,
    billNumber: string | number
  ): Promise<LegislativeStatus> {
    return legislationService.getCurrentStatus({
      biennium,
      billNumber: String(billNumber),
    });
  }

  async getLegislation(
    biennium: Biennium,
    billNumber: string | number
  ): Promise<Legislation[]> {
    return legislationService.getLegislation({
      biennium,
      billNumber: String(billNumber),
    });
  }

  async getSponsors(biennium: Biennium, billId: string): Promise<Sponsor[]> {
    return legislationService.getSponsors({ biennium, billId });
  }

  async getDocumentClasses(biennium: Biennium): Promise<DocumentClass[]> {
    return legislativeDocumentService.getDocumentClasses(biennium);
  }

  async getDocuments(
    biennium: Biennium,
    documentClass?: DocumentClass,
    namedLike?: string | number
  ): Promise<LegislativeDocument[]> {
    if (namedLike) {
      namedLike = String(namedLike);

      // These throw errors if no results are found
      // We need the awaits to happen explicitly here to replace errors with empty arrays
      try {
        if (documentClass) {
          return await legislativeDocumentService.getDocumentsByClass({
            biennium,
            documentClass,
            namedLike,
          });
        } else {
          return await legislativeDocumentService.getDocuments({
            biennium,
            namedLike,
          });
        }
      } catch (error) {
        if (errorHas(error, "No legislative documents found")) {
          return [];
        }
        throw error;
      }
    }

    if (documentClass) {
      return legislativeDocumentService.getAllDocumentsByClass({
        biennium,
        documentClass,
      });
    }

    throw new Error("Must provide either documentClass or namedLike");
  }
}

const errorHas = (error: unknown, msg: string) =>
  error instanceof Error && error.message.includes(msg);

export const wslWebService: WSLWebService = new WSLWebService();
