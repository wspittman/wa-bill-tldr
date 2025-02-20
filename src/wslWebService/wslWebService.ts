import { legislationService } from "./services/legislationService";
import { legislativeDocumentService } from "./services/legislativeDocumentService";
import {
  Agency,
  Biennium,
  DocumentClass,
  Legislation,
  LegislationInfo,
  LegislativeDocument,
} from "./types/models";

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

  async getLegislationStatus(biennium: Biennium, billNumber: string | number) {
    return legislationService.getCurrentStatus({
      biennium,
      billNumber: String(billNumber),
    });
  }

  async getLegislation(options: {
    biennium?: Biennium;
    billNumber?: string;
    requestNumber?: string;
    sinceDate?: string;
  }): Promise<Legislation[]> {
    /*
    B/requestNumber -> single
    B/billNumber <-- this is ours
    sinceDate
    */
    if (options.sinceDate) {
      return legislationService.getLegislationIntroducedSince(
        options.sinceDate
      );
    }
    // HERE: filling this out

    // TODO: Implement getting full bill text
    throw new Error("Not implemented");
  }

  async getSponsors(biennium: Biennium, billId: string) {
    return legislationService.getSponsors({ biennium, billId });
  }

  async getDocumentClasses(biennium: Biennium) {
    return legislativeDocumentService.getDocumentClasses(biennium);
  }

  async getDocuments(
    biennium: Biennium,
    documentClass?: DocumentClass,
    namedLike?: string
  ): Promise<LegislativeDocument[]> {
    if (documentClass && namedLike) {
      return legislativeDocumentService.getDocumentsByClass({
        biennium,
        documentClass,
        namedLike,
      });
    }

    if (documentClass) {
      return legislativeDocumentService.getAllDocumentsByClass({
        biennium,
        documentClass,
      });
    }

    if (namedLike) {
      return legislativeDocumentService.getDocuments({
        biennium,
        namedLike,
      });
    }

    throw new Error("Must provide either documentClass or namedLike");
  }
}

export const wslWebService = new WSLWebService();
