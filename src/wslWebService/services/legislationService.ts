import type {
  Amendment,
  Biennium,
  Hearing,
  Legislation,
  LegislationInfo,
  LegislationType,
  LegislativeStatus,
  RollCall,
  Sponsor,
} from "../types/models.ts";
import { BaseService } from "./baseService.ts";

class LegislationService extends BaseService {
  protected readonly wsdlFileName = "LegislationService.wsdl";

  async getLegislation(options: {
    biennium: Biennium;
    billNumber: string;
  }): Promise<Legislation[]> {
    const result = await this.soapCall("GetLegislation", options);
    return result?.Legislation || [];
  }

  async getCurrentStatus(options: {
    biennium: Biennium;
    billNumber: string;
  }): Promise<LegislativeStatus> {
    const result = await this.soapCall("GetCurrentStatus", options);
    return result;
  }

  async getLegislationByYear(year: string): Promise<LegislationInfo[]> {
    const result = await this.soapCall("GetLegislationByYear", { year });
    return result?.LegislationInfo || [];
  }

  async getAmendmentsForBiennium(options: {
    biennium: Biennium;
    billNumber: string;
  }): Promise<Amendment[]> {
    const result = await this.soapCall("GetAmendmentsForBiennium", options);
    return result?.Amendment || [];
  }

  async getSponsors(options: {
    biennium: Biennium;
    billId: string;
  }): Promise<Sponsor[]> {
    const result = await this.soapCall("GetSponsors", options);
    return result?.Sponsor || [];
  }

  async getRollCalls(options: {
    biennium: Biennium;
    billNumber: string;
  }): Promise<RollCall[]> {
    const result = await this.soapCall("GetRollCalls", options);
    return result?.RollCall || [];
  }

  async getHearings(options: {
    biennium: Biennium;
    billNumber: string;
  }): Promise<Hearing[]> {
    const result = await this.soapCall("GetHearings", options);
    return result?.Hearing || [];
  }

  async getLegislationTypes(): Promise<LegislationType[]> {
    const result = await this.soapCall("GetLegislationTypes", {});
    return result?.LegislationType || [];
  }

  async getLegislationPassedLegislature(
    biennium: Biennium
  ): Promise<LegislationInfo[]> {
    const result = await this.soapCall("GetLegislationPassedLegislature", {
      biennium,
    });
    return result?.LegislationInfo || [];
  }

  async getAmendmentsForYear(options: {
    year: string;
    billNumber: string;
  }): Promise<Amendment[]> {
    const result = await this.soapCall("GetAmendmentsForYear", options);
    return result?.Amendment || [];
  }

  async getLegislationByRequestNumber(options: {
    biennium: Biennium;
    requestNumber: string;
  }): Promise<Legislation> {
    const result = await this.soapCall(
      "GetLegislationByRequestNumber",
      options
    );
    return result;
  }

  async getRcwCitesAffected(options: {
    biennium: Biennium;
    billId: string;
  }): Promise<any[]> {
    const result = await this.soapCall("GetRcwCitesAffected", options);
    return result?.RcwCiteAffected || [];
  }

  async getSessionLawChapter(options: {
    biennium: Biennium;
    billId: string;
  }): Promise<any> {
    const result = await this.soapCall("GetSessionLawChapter", options);
    return result?.SessionLaw;
  }

  async getLegislationIntroducedSince(
    sinceDate: string
  ): Promise<Legislation[]> {
    const result = await this.soapCall("GetLegislationIntroducedSince", {
      sinceDate,
    });
    return result?.Legislation || [];
  }

  async getPrefiledLegislation(): Promise<Legislation[]> {
    const result = await this.soapCall("GetPrefiledLegislation", {});
    return result?.Legislation || [];
  }

  async getLegislationHistoricalRecapCategories(options: {
    biennium: Biennium;
    billNumber: string;
    beginDate: string;
    endDate: string;
  }): Promise<any[]> {
    const result = await this.soapCall(
      "GetLegislationHistoricalRecapCategoriesByLegislationNumber",
      options
    );
    return result?.LegislationRecapCategories || [];
  }

  async getLegislativeStatusChangesByDateRange(options: {
    biennium: Biennium;
    beginDate: string;
    endDate: string;
  }): Promise<LegislativeStatus[]> {
    const result = await this.soapCall(
      "GetLegislativeStatusChangesByDateRange",
      options
    );
    return result?.LegislativeStatus || [];
  }

  async getHouseLegislationPassedHouse(
    biennium: Biennium
  ): Promise<LegislationInfo[]> {
    const result = await this.soapCall("GetHouseLegislationPassedHouse", {
      biennium,
    });
    return result?.LegislationInfo || [];
  }

  async getHouseLegislationPassedSenate(
    biennium: Biennium
  ): Promise<LegislationInfo[]> {
    const result = await this.soapCall("GetHouseLegislationPassedSenate", {
      biennium,
    });
    return result?.LegislationInfo || [];
  }

  async getSenateLegislationPassedSenate(
    biennium: Biennium
  ): Promise<LegislationInfo[]> {
    const result = await this.soapCall("GetSenateLegislationPassedSenate", {
      biennium,
    });
    return result?.LegislationInfo || [];
  }

  async getSenateLegislationPassedHouse(
    biennium: Biennium
  ): Promise<LegislationInfo[]> {
    const result = await this.soapCall("GetSenateLegislationPassedHouse", {
      biennium,
    });
    return result?.LegislationInfo || [];
  }

  async getLegislationGovernorSigned(options: {
    biennium: Biennium;
    agency: "House" | "Senate";
  }): Promise<LegislationInfo[]> {
    const result = await this.soapCall("GetLegislationGovernorSigned", options);
    return result?.LegislationInfo || [];
  }

  async getLegislationGovernorVeto(options: {
    biennium: Biennium;
    agency: "House" | "Senate";
  }): Promise<LegislationInfo[]> {
    const result = await this.soapCall("GetLegislationGovernorVeto", options);
    return result?.LegislationInfo || [];
  }

  async getLegislationGovernorPartialVeto(options: {
    biennium: Biennium;
    agency: "House" | "Senate";
  }): Promise<LegislationInfo[]> {
    const result = await this.soapCall(
      "GetLegislationGovernorPartialVeto",
      options
    );
    return result?.LegislationInfo || [];
  }

  async getPublishedEnrolledLegislation(
    biennium: Biennium
  ): Promise<LegislationInfo[]> {
    const result = await this.soapCall("GetPublishedEnrolledLegislation", {
      biennium,
    });
    return result?.LegislationInfo || [];
  }

  async getLegislationPassedHouseWithinTimeFrame(options: {
    beginDate: string;
    endDate: string;
  }): Promise<LegislationInfo[]> {
    const result = await this.soapCall(
      "GetLegislationPassedHouseWithinTimeFrame",
      options
    );
    return result?.LegislationInfo || [];
  }

  async getLegislationPassedSenateWithinTimeFrame(options: {
    beginDate: string;
    endDate: string;
  }): Promise<LegislationInfo[]> {
    const result = await this.soapCall(
      "GetLegislationPassedSenateWithinTimeFrame",
      options
    );
    return result?.LegislationInfo || [];
  }

  async getLegislationPassedLegislatureWithinTimeFrame(options: {
    beginDate: string;
    endDate: string;
  }): Promise<LegislationInfo[]> {
    const result = await this.soapCall(
      "GetLegislationPassedLegislatureWithinTimeFrame",
      options
    );
    return result?.LegislationInfo || [];
  }

  async getLegislativeStatusChangesByBillNumber(options: {
    biennium: Biennium;
    billNumber: string;
    beginDate: string;
    endDate: string;
  }): Promise<LegislativeStatus[]> {
    const result = await this.soapCall(
      "GetLegislativeStatusChangesByBillNumber",
      options
    );
    return result?.LegislativeStatus || [];
  }

  async getLegislativeStatusChangesByBillId(options: {
    biennium: Biennium;
    billId: string;
    beginDate: string;
    endDate: string;
  }): Promise<LegislativeStatus[]> {
    const result = await this.soapCall(
      "GetLegislativeStatusChangesByBillId",
      options
    );
    return result?.LegislativeStatus || [];
  }

  async getTotalLegislationIntroducedByDateRange(options: {
    beginDate: string;
    endDate: string;
    legTypeId: string;
    agencyId: string;
    allVersions: string;
  }): Promise<number> {
    const result = await this.soapCall(
      "GetTotalLegislationIntroducedByDateRange",
      options
    );
    return result || 0;
  }

  async getLegislationInfoIntroducedSince(
    sinceDate: string
  ): Promise<LegislationInfo[]> {
    const result = await this.soapCall("GetLegislationInfoIntroducedSince", {
      sinceDate,
    });
    return result?.LegislationInfo || [];
  }

  async getPreFiledLegislationInfo(): Promise<LegislationInfo[]> {
    const result = await this.soapCall("GetPreFiledLegislationInfo", {});
    return result?.LegislationInfo || [];
  }

  async getLegislationPassedHouse(
    biennium: Biennium
  ): Promise<LegislationInfo[]> {
    const result = await this.soapCall("GetLegislationPassedHouse", {
      biennium,
    });
    return result?.LegislationInfo || [];
  }

  async getLegislationPassedSenate(
    biennium: Biennium
  ): Promise<LegislationInfo[]> {
    const result = await this.soapCall("GetLegislationPassedSenate", {
      biennium,
    });
    return result?.LegislationInfo || [];
  }

  async getLegislationNotYetIntroducedInHouseOfOrigin(
    biennium: Biennium
  ): Promise<LegislationInfo[]> {
    const result = await this.soapCall(
      "GetLegislationNotYetIntroducedInHouseOfOrigin",
      { biennium }
    );
    return result?.LegislationInfo || [];
  }

  async getLegislationPassedOriginalBodyAndNotIntroducedInOppositeBody(
    biennium: Biennium
  ): Promise<LegislationInfo[]> {
    const result = await this.soapCall(
      "GetLegislationPassedOriginalBodyAndNotIntroducedInOppositeBody",
      { biennium }
    );
    return result?.LegislationInfo || [];
  }

  async getLegislativeBillListFeatureData(): Promise<any> {
    const result = await this.soapCall("GetLegislativeBillListFeatureData", {});
    return result?.DataTable;
  }
}

export const legislationService: LegislationService = new LegislationService();
