export const LEFT_W = 272;
export const RIGHT_MIN = 280;
export const RIGHT_MAX = 900;
export const RIGHT_ENTITY_ATTRS_W = 680;

export const TOTAL_EXCEPTIONS = 5;

export type RightTab = "tree" | "document";

export const ENTITY_CASE_NUMBERS: Record<string, string> = {
  "BlackRock Advisors": "KYC-28821",
  "BlackRock Institutional": "KYC-28834",
  "Entity 13": "KYC-29107",
};

export const DEFAULT_ENTITIES: string[] = [
  "BlackRock Advisors",
  "BlackRock Institutional",
  "Entity 13",
];

export type CaseWorkspaceViewModel = {
  entityCaseNumbers: Record<string, string>;
  defaultEntities: string[];
  totalExceptions: number;
};

export function getCaseWorkspaceViewModel(): CaseWorkspaceViewModel {
  // TODO: replace with TanStack Query API call
  return {
    entityCaseNumbers: ENTITY_CASE_NUMBERS,
    defaultEntities: DEFAULT_ENTITIES,
    totalExceptions: TOTAL_EXCEPTIONS,
  };
}
