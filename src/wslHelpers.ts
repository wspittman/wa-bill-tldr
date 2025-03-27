import type {
  Legislation,
  LegislativeDocument,
  Sponsor,
} from "./wslWebService/types/models.ts";
import { wslWebService } from "./wslWebService/wslWebService.ts";

const biennium = "2025-26";
const year = biennium.slice(0, 4);

export async function getLegislationIds(): Promise<number[]> {
  const ids = new Set<number>();
  const legInfos = await wslWebService.getLegislationMetaByYear(year);

  // Sometimes there are duplicates for reasons I don't understand
  // eg. "HB 1015" vs "SHB 1015"
  for (const { BillNumber: id } of legInfos) {
    ids.add(id);
  }

  return Array.from(ids);
}

export async function getLastActionDate(id: number): Promise<Date> {
  const status = await wslWebService.getLegislationStatus(biennium, id);
  return status.ActionDate;
}

export async function getBillInfo(id: number): Promise<{
  legislation: Legislation[];
  sponsors: Sponsor[];
}> {
  const legislation = await wslWebService.getLegislation(biennium, id);

  if (0 in legislation) {
    const sponsors = await wslWebService.getSponsors(
      biennium,
      // This is different than id
      legislation[0].BillId
    );
    return { legislation, sponsors };
  }

  return { legislation: [], sponsors: [] };
}

export async function getBillDocInfo(
  id: number
): Promise<LegislativeDocument[]> {
  return wslWebService.getDocuments(biennium, "Bills", id);
}
