// All currently existing biennia as of this commit
export type Biennium =
  | "1991-92"
  | "1993-94"
  | "1995-96"
  | "1997-98"
  | "1999-00"
  | "2001-02"
  | "2003-04"
  | "2005-06"
  | "2007-08"
  | "2009-10"
  | "2011-12"
  | "2013-14"
  | "2015-16"
  | "2017-18"
  | "2019-20"
  | "2021-22"
  | "2023-24"
  | "2025-26";

// All currently existing document classes from 1991-2026
export type DocumentClass =
  | "Amendments"
  | "Bill Reports"
  | "Bills"
  | "Digests"
  | "Initiatives"
  | "Reports"
  | "Workroom Reports";

export type VoteType = "Yea" | "Nay" | "Absent" | "Excused";
export type RecommendationType = "Majority" | "Minority";
export type Agency = "House" | "Senate";

// Base Interfaces

export interface LegislativeEntity {
  Id: number;
  Name?: string;
  LongName?: string;
  Agency?: Agency;
  Acronym?: string;
}

export interface LegislationType {
  ShortLegislationType?: string;
  LongLegislationType?: string;
}

// People and Organizations

export interface Committee extends LegislativeEntity {
  Phone?: string;
}

export interface Member extends LegislativeEntity {
  Party?: string;
  District?: string;
  Phone?: string;
  Email?: string;
  FirstName?: string;
  LastName?: string;
}

export interface Sponsor extends LegislativeEntity {
  Type?: string;
  Order: number;
  Phone?: string;
  Email?: string;
  FirstName?: string;
  LastName?: string;
}

// Legislation Related

export interface LegislationInfo {
  Biennium: Biennium;
  BillId: string;
  BillNumber: number;
  SubstituteVersion: number;
  EngrossedVersion: number;
  ShortLegislationType?: LegislationType;
  OriginalAgency: Agency;
  Active: boolean;
  DisplayNumber?: string;
}

export interface Legislation extends LegislationInfo {
  StateFiscalNote: boolean;
  LocalFiscalNote: boolean;
  Appropriations: boolean;
  RequestedByGovernor: boolean;
  RequestedByBudgetCommittee: boolean;
  RequestedByDepartment: boolean;
  RequestedByOther: boolean;
  ShortDescription?: string;
  Request?: string;
  IntroducedDate: Date;
  CurrentStatus?: LegislativeStatus;
  Sponsor?: string;
  PrimeSponsorID: number;
  LongDescription?: string;
  LegalTitle?: string;
  Companions?: Companion[];
}

export interface LegislativeStatus {
  BillId?: string;
  HistoryLine?: string;
  ActionDate: Date;
  AmendedByOppositeBody: boolean;
  PartialVeto: boolean;
  Veto: boolean;
  AmendmentsExist: boolean;
  Status?: string;
}

export interface Companion {
  Biennium?: Biennium;
  BillId?: string;
  Status?: string;
}

export interface LegislationFamily {
  Biennium?: Biennium;
  LegislationNumber: number;
  LegislationType?: LegislationType;
  OriginalAgency?: Agency;
  ScheduledMeetings?: LegislationFamilyMeeting[];
}

// Committee Meetings and Hearings

export interface CommitteeMeeting {
  AgendaId: number;
  Agency?: Agency;
  Committees?: Committee[];
  Room?: string;
  Building?: string;
  Address?: string;
  City?: string;
  State?: string;
  ZipCode: number;
  Date: string;
  Cancelled: boolean;
  RevisedDate: string;
  ContactInformation?: string;
  CommitteeType?: string;
  Notes?: string;
}

export interface CommitteeMeetingItem {
  AgendaId: number;
  HearingType?: string;
  HearingTypeDescription?: string;
  BillId?: string;
  ItemDescription?: string;
  Order: number;
  Biennium?: Biennium;
  SortOrderString?: string;
}

export interface LegislationFamilyMeeting {
  MeetingTime: string;
  Committees?: Committee[];
  HearingType?: string;
}

export interface Hearing {
  BillId?: string;
  Biennium?: Biennium;
  CommitteeMeeting?: CommitteeMeeting;
  HearingType?: string;
  HearingTypeDescription?: string;
}

export interface CommitteeReferral {
  LegislationInfo?: LegislationInfo;
  Committee?: Committee;
  ReferredDate: string;
}

export interface CommitteeAction {
  AgendaId: number;
  HearingDate: string;
  LegislationInfo?: LegislationInfo;
  Committee?: Committee;
  ReferredToCommittee?: Committee;
  CommitteeRecommendations?: CommitteeRecommendation[];
}

export interface CommitteeRecommendation {
  Recommendation?: string;
  LongRecommendation?: string;
  RecommendationType: RecommendationType;
  MembersSigned?: string;
  Signatures?: Signature[];
}

// Voting and Signatures

export interface RollCall {
  Agency?: Agency;
  BillId?: string;
  Biennium?: Biennium;
  Motion?: string;
  SequenceNumber: number;
  VoteDate: string;
  YeaVotes?: RollCallType;
  NayVotes?: RollCallType;
  AbsentVotes?: RollCallType;
  ExcusedVotes?: RollCallType;
  Votes?: Vote[];
}

export interface RollCallType {
  Count: number;
  MembersVoting?: string;
}

export interface Vote {
  MemberId: number;
  Name?: string;
  Vote: VoteType;
}

export interface Signature {
  MemberId: number;
  Name?: string;
  Position?: string;
  PositionSort: number;
}

// Documents and Citations

export interface SessionLaw {
  ChapterNumber: number;
  Year: number;
  LegislativeSession?: string;
  LegislatureNumber: number;
  EffectiveDate: string;
  MultipleEffectiveDates: boolean;
  BillId?: string;
  Biennium?: Biennium;
  BillTitle?: string;
  PartialVeto: boolean;
  Veto: boolean;
  LegTypeId: number;
}

export interface Amendment {
  BillNumber: number;
  Name?: string;
  BillId?: string;
  LegislativeSession?: string;
  Type?: string;
  FloorNumber: number;
  SponsorName?: string;
  Description?: string;
  Drafter?: string;
  FloorAction?: string;
  FloorActionDate: string;
  DocumentExists: boolean;
  HtmUrl?: string;
  PdfUrl?: string;
  Agency?: Agency;
}

export interface RcwCiteAffected {
  RcwCite?: string;
  Action?: string;
}

export interface LegislativeDocument {
  Name?: string;
  ShortFriendlyName?: string;
  Biennium?: Biennium;
  LongFriendlyName?: string;
  Description?: string;
  Type?: string;
  Class?: DocumentClass;
  HtmUrl?: string;
  HtmCreateDate: Date;
  HtmLastModifiedDate: Date;
  PdfUrl?: string;
  PdfCreateDate: Date;
  PdfLastModifiedDate: Date;
  BillId?: string;
}

export interface LegislativeRecapCategories {
  BillNumber: number;
  HistoryText?: string;
  ActionDate: string;
  Category?: string;
  Agency?: Agency;
}
