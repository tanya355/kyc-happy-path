import {
  ENHANCED_OWNERS,
  type EnhancedOwnerRow,
} from "@/components/kyc/BeneficialOwnersView";

export type RiskFlag = "high" | "medium" | "low";

export type FilterType =
  | "all"
  | "low-confidence"
  | "needs-review"
  | "missing-evidence"
  | "exceptions";

export type StatusValue =
  | "in-review"
  | "action-required"
  | "pending-documents"
  | "on-hold"
  | "ready-for-sign-off";

export type LensIconToken =
  | "flag"
  | "shield"
  | "users"
  | "briefcase"
  | "trending-down";

export type FilterContentIconToken =
  | "alert-triangle"
  | "trending-down"
  | "message-circle"
  | "file-text"
  | "flag";

export type RecommendationIconToken =
  | "zap"
  | "shield"
  | "lightbulb"
  | "sparkles"
  | "flag";

export type UrgencyLevel = "High" | "Medium" | "Low";

export interface AttributeItem {
  id: string;
  name: string;
  desc: string;
  confidence: number;
  action: "none" | "request" | "review";
  analystChoice?: { label: string; source: string };
  aiOriginal?: { label: string; source: string };
}

export interface Subsection {
  id: string;
  title: string;
  attrs: number;
  verified: number;
  needReview?: number;
  missing?: number;
  items: AttributeItem[];
  ownerRows?: EnhancedOwnerRow[];
  hiddenVerified: number;
}

export interface EntitySection {
  id: string;
  name: string;
  entityType: "entity" | "principal" | "beneficial-owner";
  customerType?: string;
  status?: StatusValue;
  cip: Subsection[];
  dueDiligence: Subsection[];
}

export interface QueueEntry {
  id: string;
  entity: string;
  type: string;
  risk: RiskFlag;
  assignee: string;
  due: string;
}

export interface ItemDecision {
  subsection: string;
  heading: string;
  description: string;
  reasoning: { title: string; text: string; risk: string; source: string };
  options: { label: string; desc: string }[];
  isMissing?: boolean;
  aiRecommended?: number;
  aiRationale?: string;
}

export interface ReviewLens {
  id: string;
  label: string;
  iconToken: LensIconToken;
  filterDesc: string;
  reasoning: string;
  followUps: { q: string; a: string }[];
}

export interface FilterContentEntry {
  sectionLabel: string;
  itemIconToken: FilterContentIconToken;
  itemIconColor: string;
  actions: { label: string; urgency: UrgencyLevel }[];
  recommendations: { iconToken: RecommendationIconToken; text: string }[];
}

export interface StatusConfigEntry {
  label: string;
  dot: string;
  text: string;
  bg: string;
  border: string;
}

export const QUEUE: QueueEntry[] = [
  { id: "q1", entity: "BlackRock Advisors",  type: "AI Evidence Selection",  risk: "high",   assignee: "Alex Smith",  due: "Apr 25" },
  { id: "q2", entity: "State Street Corp",   type: "UBO Determination",      risk: "high",   assignee: "Riley Park",  due: "Apr 25" },
  { id: "q3", entity: "JPMorgan Asset Mgmt", type: "Source of Wealth",       risk: "medium", assignee: "Alex Smith",  due: "Apr 27" },
  { id: "q4", entity: "T. Rowe Price",       type: "PEP Form Sign-off",      risk: "medium", assignee: "Sam Torres",  due: "Apr 28" },
  { id: "q5", entity: "Invesco Ltd.",        type: "Risk Classification",    risk: "low",    assignee: "Jordan Lee",  due: "Apr 30" },
];

export const ENTITY_SECTIONS: EntitySection[] = [
  {
    id: "advisors",
    name: "BlackRock Advisors LLC",
    entityType: "entity",
    customerType: "Registered Investment Adviser",
    status: "action-required",
    cip: [
      {
        id: "entity-id", title: "Entity Identification", attrs: 8, verified: 6, hiddenVerified: 0,
        items: [
          { id: "ei-1", name: "Legal Entity Name", desc: "Mismatch: 'BlackRock Group Holdings Ltd.'", confidence: 42, action: "review",
            analystChoice: { label: "Uphold Analyst's Choice", source: "Keep email confirmation as source" },
            aiOriginal:    { label: "Revert to AI's Original", source: "Set board resolution as source" } },
          { id: "ei-2",  name: "Registration Number",       desc: "0000890114 — Delaware",                  confidence: 100, action: "none" },
          { id: "ei-3",  name: "Registered Address",        desc: "55 East 52nd Street, New York, NY",       confidence: 98,  action: "none" },
          { id: "ei-4",  name: "Date of Incorporation",     desc: "March 14, 1988 — Delaware",               confidence: 100, action: "none" },
          { id: "ei-5",  name: "Entity Type",               desc: "Registered Investment Adviser (RIA)",      confidence: 100, action: "none" },
          { id: "ei-6",  name: "Tax ID / EIN",              desc: "13-3150776",                               confidence: 98,  action: "none" },
          { id: "ei-7",  name: "Authorized Signatory",      desc: "Lawrence D. Fink — CEO",                  confidence: 91,  action: "none" },
          { id: "ei-8",  name: "Primary Business Activity", desc: "Investment Advisory & Asset Management",  confidence: 100, action: "none" },
        ],
      },
      {
        id: "beneficial-owners", title: "Beneficial Owners", attrs: 3, verified: 1,
        needReview: 1, missing: 1, hiddenVerified: 0, items: [],
        ownerRows: ENHANCED_OWNERS,
      },
    ],
    dueDiligence: [
      {
        id: "risk-screening", title: "Risk Screening", attrs: 5, verified: 4, hiddenVerified: 0,
        items: [
          { id: "rs-1", name: "PEP Status – L. Fink", desc: "Elevated — politically exposed person", confidence: 62, action: "review",
            analystChoice: { label: "Uphold Analyst's Choice", source: "Keep Refinitiv PEP database match" },
            aiOriginal:    { label: "Revert to AI's Original", source: "Set manual PEP assessment" } },
          { id: "rs-2",  name: "Sanctions Screening",    desc: "No matches — OFAC, UN, EU lists checked",       confidence: 100, action: "none" },
          { id: "rs-3",  name: "Adverse Media – Entity", desc: "No material adverse media identified",            confidence: 85,  action: "none" },
          { id: "rs-4",  name: "Country Risk Assessment",desc: "USA — Low risk jurisdiction",                     confidence: 100, action: "none" },
          { id: "rs-5",  name: "Negative News Screening", desc: "Cleared — no relevant findings",                 confidence: 78,  action: "none" },
        ],
      },
      {
        id: "source-wealth", title: "Source of Wealth & Funds", attrs: 4, verified: 3, hiddenVerified: 0,
        items: [
          { id: "sw-1", name: "AUM Verification", desc: "Pending external data source", confidence: 40, action: "review",
            analystChoice: { label: "Uphold Analyst's Choice", source: "Keep analyst-confirmed AUM figure" },
            aiOriginal:    { label: "Revert to AI's Original", source: "Set Annual Report 2023 as source" } },
          { id: "sw-2",  name: "Fund Origin Documentation",       desc: "US-domiciled — verified via prospectus",       confidence: 90,  action: "none" },
          { id: "sw-3",  name: "Revenue Source Classification",   desc: "Management fees & performance income",         confidence: 87,  action: "none" },
          { id: "sw-4",  name: "Annual Report Cross-Reference",   desc: "FY 2023 — Filed SEC EDGAR",                   confidence: 82,  action: "none" },
        ],
      },
    ],
  },
  {
    id: "institutional",
    name: "BlackRock Institutional Trust Co.",
    entityType: "entity",
    customerType: "Institutional Investor",
    status: "pending-documents",
    cip: [
      {
        id: "inst-entity-id", title: "Entity Identification", attrs: 6, verified: 5, hiddenVerified: 0,
        items: [
          { id: "inst-1", name: "Offering Memorandum", desc: "Not submitted — overdue", confidence: 0, action: "request",
            analystChoice: { label: "Request from Client", source: "Send formal document request" },
            aiOriginal:    { label: "Mark as Evidence Gap", source: "Flag case as incomplete" } },
          { id: "inst-2",  name: "Entity Classification",    desc: "Institutional Investor — Trust Company",     confidence: 95,  action: "none" },
          { id: "inst-3",  name: "Registered Address",       desc: "400 Howard Street, San Francisco, CA",      confidence: 98,  action: "none" },
          { id: "inst-4",  name: "Operating Jurisdiction",   desc: "California — FDIC supervised",              confidence: 100, action: "none" },
          { id: "inst-5",  name: "Tax ID / EIN",             desc: "94-2563933",                                confidence: 97,  action: "none" },
          { id: "inst-6",  name: "Date of Incorporation",    desc: "January 22, 1976 — California",             confidence: 100, action: "none" },
        ],
      },
    ],
    dueDiligence: [
      {
        id: "related-parties", title: "Related Parties & UBO", attrs: 4, verified: 3, hiddenVerified: 0,
        items: [
          { id: "rp-1", name: "UBO – Vanguard Group (35%)", desc: "Cross-reference pending", confidence: 58, action: "review",
            analystChoice: { label: "Uphold Analyst's Choice", source: "Keep analyst-sourced Form 13F filing" },
            aiOriginal:    { label: "Revert to AI's Original", source: "Set SEC registry extract as source" } },
          { id: "rp-2",  name: "UBO – State Street Corp (50%)", desc: "Confirmed via SEC Form 13G — dual sourced", confidence: 75,  action: "none" },
          { id: "rp-3",  name: "Board Composition Disclosure",  desc: "7 directors confirmed — SEC proxy filing",  confidence: 82,  action: "none" },
          { id: "rp-4",  name: "Corporate Registry Extract",    desc: "California SOS — current as of Q1 2026",    confidence: 88,  action: "none" },
        ],
      },
    ],
  },
  {
    id: "principal-fink",
    name: "Principal: Lawrence D. Fink",
    entityType: "principal",
    status: "in-review",
    cip: [
      {
        id: "principal-officers", title: "Identity & Authorization", attrs: 7, verified: 5, hiddenVerified: 0,
        items: [
          { id: "po-1", name: "Passport – Lawrence D. Fink", desc: "Passport expired Mar 2024", confidence: 30, action: "review",
            analystChoice: { label: "Uphold Analyst's Choice", source: "Keep analyst-sourced updated passport copy" },
            aiOriginal:    { label: "Revert to AI's Original", source: "Set expired passport (US482901773) as source" } },
          { id: "po-2",  name: "Date of Birth",               desc: "November 2, 1952 — confirmed",              confidence: 100, action: "none" },
          { id: "po-3",  name: "Nationality",                 desc: "United States — US Citizen",                confidence: 100, action: "none" },
          { id: "po-4",  name: "Residential Address",         desc: "New York, NY — verified",                   confidence: 88,  action: "none" },
          { id: "po-5",  name: "Role Authorization Letter",   desc: "CEO appointment — Board resolution on file", confidence: 95,  action: "none" },
          { id: "po-6",  name: "Signatory Authority",         desc: "Full signatory — confirmed via board minutes", confidence: 92, action: "none" },
          { id: "po-7",  name: "PEP Assessment",              desc: "Active PEP — EDD triggered", confidence: 62, action: "review",
            analystChoice: { label: "Uphold Analyst's Choice", source: "Keep Refinitiv World-Check PEP match" },
            aiOriginal:    { label: "Revert to AI's Original", source: "Set manual PEP assessment as primary" } },
        ],
      },
    ],
    dueDiligence: [
      {
        id: "principal-edd", title: "Enhanced Due Diligence", attrs: 3, verified: 2, hiddenVerified: 0,
        items: [
          { id: "edd-1",  name: "Source of Wealth – L. Fink", desc: "BlackRock equity & compensation — verified",   confidence: 90, action: "none" },
          { id: "edd-2",  name: "Source of Funds – L. Fink",  desc: "Investment income — annual filing confirmed",  confidence: 86, action: "none" },
          { id: "edd-3",  name: "EDD Report Sign-off",         desc: "Pending QA review — EDD not yet closed", confidence: 0, action: "request",
            analystChoice: { label: "Request EDD Completion", source: "Initiate formal EDD workflow" },
            aiOriginal:    { label: "Mark as Pending", source: "Flag for QA hold" } },
        ],
      },
    ],
  },
];

export const ITEM_DECISIONS: Record<string, ItemDecision> = {
  "o3": {
    subsection: "Beneficial Owners",
    heading: "Undisclosed minority owner",
    description: "Critical supporting documentation is missing from the evidence packet. While secondary information suggests ownership, the required formal UBO declaration has not been provided.",
    reasoning: { title: "Identified Evidence Gap", text: "Scanned the collected documents and could not locate a signed UBO declaration for the listed minority shareholder.", risk: "Confidence reduced to 55%. Attribute flagged as Area of Concern for audit readiness.", source: "Certificate of Incorporation" },
    options: [
      { label: "Scan Unused Documents", desc: "Check the broader evidence packet for any unmapped proof of ownership." },
      { label: "Flag as Evidence Gap",  desc: "Mark as incomplete and generate a formal request for the missing documentation." },
    ],
    isMissing: true,
    aiRecommended: 1,
    aiRationale: "No unmapped documents detected. Formal evidence gap request is the most compliant path.",
  },
  "o1": {
    subsection: "Beneficial Owners", heading: "Vanguard Group",
    description: "The Vanguard Group holds 35% of shares. Evidence retrieved from multiple sources with 60% aggregate confidence.",
    reasoning: { title: "Multi-Source Corroboration", text: "Retrieved and cross-referenced three independent sources: a registry extract, SEC Form 13G filing, and the entity's shareholder register.", risk: "Minor discrepancy in filing dates (Q3 vs Q4 2025). Does not affect UBO threshold determination.", source: "SEC Form 13G Filing — Vanguard Group" },
    options: [
      { label: "Uphold Analyst's Choice", desc: "Accept registry extract as primary evidence source." },
      { label: "Revert to AI's Original", desc: "Set multi-source aggregate as the validated evidence base." },
    ],
  },
  "o2": {
    subsection: "Beneficial Owners", heading: "State Street Corp",
    description: "State Street Corporation holds a 50% ownership stake, confirmed via registry cross-reference.",
    reasoning: { title: "Registry Validation", text: "Cross-referenced the corporate registry extract against the SEC 13G filing for State Street Corp.", risk: "No material discrepancies. Confidence of 50% reflects entity complexity, not evidence gaps.", source: "SEC Form 13G Filing — State Street Corp" },
    options: [
      { label: "Uphold Analyst's Choice", desc: "Accept 13G filing as primary source." },
      { label: "Revert to AI's Original", desc: "Use registry extract as the primary validated source." },
    ],
  },
  "ei-1": {
    subsection: "Entity Identification", heading: "Entity Name on Document",
    description: "A mismatch between the entity name on the board resolution and the registered KYC subject name has been detected.",
    reasoning: { title: "Entity Name Mismatch", text: "Board resolution references 'BlackRock Group Holdings Ltd.' while the KYC subject is 'BlackRock Advisors LLC'. Fuzzy similarity: 61%.", risk: "Name mismatch creates an audit gap. Blocks case completion.", source: "Board Resolution BR-2024-0847" },
    options: [
      { label: "Uphold Analyst's Choice", desc: "Keep email confirmation as the name resolution source." },
      { label: "Revert to AI's Original", desc: "Set board resolution as primary source, flag for correction." },
    ],
    aiRecommended: 1,
    aiRationale: "Board resolution is the authoritative legal source. Email confirmation alone is insufficient for audit closure.",
  },
  "po-1": {
    subsection: "Principal Officers", heading: "CEO – Lawrence D. Fink",
    description: "Passport for Lawrence D. Fink (No. US482901773) expired March 2024. KYC Policy §4.2 requires valid, unexpired ID for all named signatories.",
    reasoning: { title: "Expired Identification", text: "Passport No. US482901773 extracted and validated against today's date. Expiry is 13 months past the review date.", risk: "Mandatory refresh trigger per KYC Policy §4.2. Updated copy sourced but not yet formally verified.", source: "KPMG KYC Policy §4.2 — ID Requirements" },
    options: [
      { label: "Uphold Analyst's Choice", desc: "Accept analyst-sourced updated passport copy as verified." },
      { label: "Flag for Re-submission",  desc: "Return to analyst to formally upload and verify the new passport." },
    ],
    aiRecommended: 1,
    aiRationale: "Updated copy has not been formally verified. Re-submission ensures §4.2 compliance and maintains audit trail.",
  },
  "rs-1": {
    subsection: "Risk Screening", heading: "PEP Status – L. Fink",
    description: "Lawrence D. Fink is identified as a Politically Exposed Person (PEP). This elevates the case risk profile and requires enhanced due diligence.",
    reasoning: { title: "PEP Match Detected", text: "Refinitiv World-Check and internal PEP registry both confirm active PEP status for L. Fink based on public-sector advisory roles.", risk: "EDD required before case closure. Current evidence packet may not meet enhanced threshold.", source: "Refinitiv World-Check — PEP Registry" },
    options: [
      { label: "Uphold Analyst's Choice", desc: "Accept Refinitiv PEP database match as the validated source." },
      { label: "Revert to AI's Original", desc: "Set manual PEP assessment as primary determination." },
    ],
    aiRecommended: 0,
    aiRationale: "Refinitiv World-Check match is dual-corroborated. Analyst's choice aligns with highest-confidence source.",
  },
  "sw-1": {
    subsection: "Source of Wealth", heading: "AUM Verification",
    description: "AUM figure is pending confirmation from an external data source. Analyst has provided an estimate but the formal verification is incomplete.",
    reasoning: { title: "Unverified Financial Data", text: "The analyst-provided AUM figure ($1.85T) differs from the Annual Report 2023 figure ($1.62T) by 14%. External source confirmation is pending.", risk: "AUM discrepancy may indicate outdated data or reporting differences. Requires clarification before sign-off.", source: "Annual Report 2023 — BlackRock Advisors" },
    options: [
      { label: "Uphold Analyst's Choice", desc: "Accept analyst-confirmed AUM figure with the noted discrepancy." },
      { label: "Revert to AI's Original", desc: "Set Annual Report 2023 as the authoritative AUM source." },
    ],
  },
  "rp-1": {
    subsection: "Related Parties", heading: "UBO – Vanguard Group (35%)",
    description: "Cross-reference between Form 13F and the entity registry for Vanguard Group's 35% stake is still pending full validation.",
    reasoning: { title: "Cross-Reference Pending", text: "Form 13F filing matches registry extract on ownership percentage but differs on filing dates by one quarter.", risk: "Filing date discrepancy is minor but requires confirmation for audit completeness.", source: "SEC Form 13F — Vanguard Group" },
    options: [
      { label: "Uphold Analyst's Choice", desc: "Accept analyst-sourced Form 13F filing as the primary source." },
      { label: "Revert to AI's Original", desc: "Set SEC registry extract as the validated primary source." },
    ],
  },
  "inst-1": {
    subsection: "Entity Identification", heading: "Offering Memorandum",
    description: "The updated Offering Memorandum for BlackRock Institutional Trust Co. has not been submitted. This is a required document for periodic refresh.",
    reasoning: { title: "Missing Required Document", text: "The CIP checklist requires a current Offering Memorandum for Institutional Investor classification. No document received in the current cycle.", risk: "Without this document, one CIP attribute cannot be fully validated. Case cannot reach Final Closure.", source: "KPMG CIP Policy — Institutional Investor Checklist" },
    options: [
      { label: "Request from Client", desc: "Send a formal document request to the client contact." },
      { label: "Mark as Evidence Gap",  desc: "Flag as incomplete and escalate to Relationship Manager." },
    ],
    isMissing: true,
  },
  "po-7": {
    subsection: "Identity & Authorization", heading: "PEP Assessment – L. Fink",
    description: "Lawrence D. Fink holds active PEP status confirmed via Refinitiv World-Check. Enhanced Due Diligence is triggered per FATF Recommendation 12 and must be completed before case closure.",
    reasoning: { title: "Active PEP – EDD Required", text: "Refinitiv World-Check confirms PEP status based on public-sector advisory roles held by L. Fink. Internal PEP registry corroborates the finding.", risk: "EDD must be formally completed and documented. Case cannot proceed to Final Closure without sign-off on enhanced diligence.", source: "Refinitiv World-Check — PEP Registry" },
    options: [
      { label: "Uphold Analyst's Choice", desc: "Accept Refinitiv World-Check PEP match as the primary validated source." },
      { label: "Revert to AI's Original", desc: "Set manual PEP assessment as primary, with World-Check as corroboration." },
    ],
    aiRecommended: 0,
    aiRationale: "Refinitiv World-Check is dual-corroborated with the internal registry. Analyst's choice is the highest-confidence determination.",
  },
  "edd-3": {
    subsection: "Enhanced Due Diligence", heading: "EDD Report Sign-off",
    description: "The Enhanced Due Diligence report for Lawrence D. Fink has not been formally closed. Active PEP status requires a completed EDD before the case can be signed off.",
    reasoning: { title: "EDD Incomplete", text: "Source of Wealth and Source of Funds have been validated individually, but the formal EDD workflow has not been closed. QA cannot approve the case until EDD sign-off is confirmed.", risk: "Leaving EDD open creates a regulatory gap. FATF Recommendation 12 requires documented EDD completion for PEPs before periodic refresh closure.", source: "KPMG EDD Policy — PEP Workflow Requirements" },
    options: [
      { label: "Initiate EDD Completion", desc: "Formally trigger the EDD workflow and assign to the responsible analyst." },
      { label: "Flag as QA Hold",         desc: "Place the case on hold pending EDD completion — prevent premature sign-off." },
    ],
    isMissing: true,
    aiRecommended: 1,
    aiRationale: "EDD cannot be closed without formal workflow completion. QA Hold is the safest path to preserve audit trail integrity.",
  },
};

export const REVIEW_LENSES: ReviewLens[] = [
  {
    id: "areas-of-concern",
    label: "Areas of Concern",
    iconToken: "flag",
    filterDesc: "Low confidence, overrides, missing data, and flagged attributes",
    reasoning: `Six attributes are flagged across three entities in this case. The most critical cluster sits in entity identification and beneficial ownership — an entity name mismatch on the board resolution, an unresolved UBO declaration, and an expired passport for a named signatory. AUM verification is pending against a 14% discrepancy with the 2023 Annual Report. The missing Offering Memorandum for BlackRock Institutional is the sole remaining blocker for CIP completion. Five attributes fall below the 65% confidence threshold, with three rated under 45%. These findings collectively place the case in an elevated QA scrutiny tier and require resolution before sign-off is permissible.`,
    followUps: [
      { q: "Which attribute is highest priority?", a: "The entity name mismatch is the highest priority. An email confirmation is not an authoritative source — it must be replaced with a board resolution or SEC EDGAR filing before the case can proceed. Unresolved, it blocks CIP completion and creates downstream risk for all dependent attributes." },
      { q: "What's the confidence threshold for sign-off?", a: "KPMG QA policy requires all attributes to reach ≥65% confidence before sign-off is permissible. Currently five attributes fall below this threshold, three of which are under 45%. Each must be resolved or formally excepted with documented rationale before the case can close." },
      { q: "Can I sign off with outstanding flags?", a: "No. Sign-off is not permissible while material flags remain unresolved. You may issue a Rework instruction to the analyst or raise a formal exception for each flag with documented QA rationale. Escalation to a senior reviewer is required for any flag rated Critical or involving PEP/sanctions exposure." },
    ],
  },
  {
    id: "risk-compliance",
    label: "Risk & Compliance",
    iconToken: "shield",
    filterDesc: "Regulatory exposure, sanctions, AML, and policy adherence",
    reasoning: `This case carries elevated regulatory exposure across two entities. Lawrence D. Fink's active PEP status triggers mandatory Enhanced Due Diligence under FATF Recommendation 12, and the expired passport creates an independent §4.2 refresh requirement. The AUM discrepancy between analyst data and Annual Report 2023 introduces a Source of Wealth validation gap. The missing Offering Memorandum for BlackRock Institutional prevents CIP completion. Taken together, these findings position this case in the High compliance risk tier. QA sign-off requires confirmed resolution of the PEP EDD, passport refresh, and document receipt before closure is permissible.`,
    followUps: [
      { q: "What EDD is required for the PEP?", a: "For Lawrence D. Fink as an active PEP, EDD must include: source of wealth documentation, enhanced adverse media screening via Dow Jones Factiva, second-level reviewer approval, and re-screening confirmation within the last 12 months. All findings must be recorded in the case file before QA can clear the PEP attribute." },
      { q: "Does the expired passport block closure?", a: "Yes. An expired government-issued ID cannot satisfy §4.2 identity refresh requirements. The analyst must either obtain a valid replacement document or raise a formal exception approved by a senior compliance officer. The exception must record the expiry date, reason for acceptance, and compensating controls applied." },
      { q: "How do I clear the AUM discrepancy?", a: "The 14% AUM discrepancy must be resolved against an authoritative external source — SEC Form ADV or the FY2023 Annual Report filed with EDGAR. An analyst note alone does not satisfy CDD evidence standards. Once the correct figure is sourced and documented, the attribute confidence score will update automatically." },
    ],
  },
  {
    id: "customer-experience",
    label: "Customer Experience",
    iconToken: "users",
    filterDesc: "Client friction, documentation burden, and relationship risk",
    reasoning: `The current documentation burden for this client is above average for a periodic refresh. Three separate document requests are outstanding — an updated passport, an Offering Memorandum, and UBO corroboration — which increases the risk of client fatigue and delayed response. The entity name mismatch on the board resolution may signal outdated client records and could require a sensitive communication via the Relationship Manager to avoid escalating friction. Recommend consolidating all outstanding requests into a single client communication and flagging for Relationship Risk review before issuing any further outreach.`,
    followUps: [
      { q: "How should I consolidate client requests?", a: "Coordinate with the Relationship Manager to bundle all three outstanding requests — passport refresh, Offering Memorandum, and UBO corroboration — into a single client communication. Staggered or duplicated outreach significantly increases client fatigue and response time. A single, clearly scoped request with a defined response deadline is the recommended approach." },
      { q: "What's the risk of client non-response?", a: "If the client does not respond within the SLA window (typically 14 days for periodic refresh), the case must be escalated under the Non-Responsive Client procedure. The Relationship Manager must be notified, and if no response is received after a second request, the account may be subject to a restriction hold pending Compliance review." },
      { q: "Should the RM be looped in now?", a: "Yes — given the volume and sensitivity of outstanding requests, Relationship Manager involvement is recommended before any further client outreach. The RM can assess the client's current engagement level, advise on tone and timing, and help pre-empt friction around the entity name clarification, which is the most sensitive of the three gaps." },
    ],
  },
  {
    id: "sales-relationship",
    label: "Sales / Relationship",
    iconToken: "briefcase",
    filterDesc: "Commercial sensitivity, deal risk, and relationship manager considerations",
    reasoning: `BlackRock is a strategically significant client with a complex multi-entity DRG structure. The current case has three outstanding document requests — any of which could generate friction if not handled carefully. The passport expiry for Lawrence D. Fink is likely known to the client and should be framed as a routine compliance refresh rather than an escalation. The missing Offering Memorandum for BlackRock Institutional represents the most commercially sensitive gap; a delay here risks disrupting the periodic refresh cycle and creating a hold on client services. Recommend looping in the Relationship Manager before issuing formal document requests, and coordinating outreach timing to avoid competing communications. AUM discrepancy should be resolved internally where possible before client contact.`,
    followUps: [
      { q: "Is there a hold risk on client services?", a: "Yes. The missing Offering Memorandum for BlackRock Institutional is the primary service-hold risk. Until CIP is complete for that entity, any new product subscriptions or account amendments under the institutional structure may be blocked. The RM should be made aware so they can manage client expectations and timeline accordingly." },
      { q: "How do I frame the passport request?", a: "Frame the passport refresh as a routine periodic compliance update rather than a new or escalated requirement. Suggested language: 'As part of our standard periodic refresh, we require an updated copy of the government-issued ID on file for [name]. This is a routine requirement and does not affect your current services.' Avoid referencing expiry dates or policy breaches in the initial outreach." },
      { q: "Can the AUM discrepancy be resolved internally?", a: "Yes, in most cases. The AUM discrepancy should first be checked against EDGAR Form ADV and the FY2023 Annual Report before initiating any client contact. If the correct figure can be sourced and verified internally, no client outreach is required. Client contact should only be initiated if the discrepancy cannot be reconciled from public filings." },
    ],
  },
  {
    id: "analyst-overrides",
    label: "Analyst Overrides",
    iconToken: "trending-down",
    filterDesc: "Attributes where the analyst has overridden the AI selection",
    reasoning: `Six analyst overrides have been recorded across this case. The most significant are in entity identification — the analyst accepted an email confirmation to resolve an entity name mismatch instead of the board resolution, and manually confirmed a PEP determination against the AI-recommended Refinitiv World-Check source. AUM figures were adjusted from the Annual Report 2023 baseline without a corroborating source. Each override requires an explicit QA counter-review and documented rationale before the case can proceed to sign-off. Cross-entity consistency should be validated to ensure override decisions are not in conflict across BlackRock Advisors and BlackRock Institutional.`,
    followUps: [
      { q: "Do all overrides need QA rationale?", a: "Yes. Every analyst override must have an explicit QA counter-review note recorded in the case file. The note must state: the original AI determination, the analyst's override reason, the QA reviewer's assessment, and the final accepted decision. Cases with undocumented overrides cannot be closed." },
      { q: "Which override is highest risk?", a: "The entity name override is highest risk. Accepting an email confirmation in place of a board resolution or SEC filing introduces a material evidence gap. If challenged by an auditor or regulator, this override has the weakest defensibility of the six. QA should instruct rework to replace the email with an authoritative source before proceeding." },
      { q: "How do I check cross-entity consistency?", a: "Compare the override decisions recorded for BlackRock Advisors LLC against those for BlackRock Institutional. Any attribute that has been resolved differently across entities in the same DRG — particularly AUM, UBO, or entity name — requires a documented reconciliation note explaining why the treatment differs and confirming it is intentional and policy-compliant." },
    ],
  },
];

export const STATUS_CONFIG: Record<StatusValue, StatusConfigEntry> = {
  "in-review":          { label: "In Review",          dot: "var(--color-dark-blue-600)", text: "var(--color-dark-blue-600)", bg: "var(--color-dark-blue-000)",  border: "var(--color-dark-blue-100)" },
  "action-required":    { label: "Action Required",    dot: "var(--color-red-700)",       text: "var(--color-red-700)",       bg: "var(--color-red-000)",        border: "var(--color-red-200)"        },
  "pending-documents":  { label: "Pending Documents",  dot: "var(--color-yellow-600)",    text: "var(--color-neutral-900)",   bg: "var(--color-yellow-000)",     border: "var(--color-yellow-300)"    },
  "on-hold":            { label: "On Hold",            dot: "var(--color-neutral-500)",   text: "var(--color-neutral-600)",   bg: "var(--color-neutral-100)",    border: "var(--color-neutral-300)"   },
  "ready-for-sign-off": { label: "Ready for Sign-off", dot: "var(--color-green-700)",     text: "var(--color-green-700)",     bg: "var(--color-green-000)",      border: "var(--color-green-100)"     },
};

export const FILTERS: { id: FilterType; label: string }[] = [
  { id: "all",              label: "All Flagged" },
  { id: "low-confidence",   label: "Low Confidence" },
  { id: "needs-review",     label: "Needs Review" },
  { id: "missing-evidence", label: "Conflicting Evidence" },
  { id: "exceptions",       label: "Exceptions" },
];

export const FILTER_CONTENT: Record<FilterType, FilterContentEntry> = {
  all: {
    sectionLabel: "All Flagged Attributes",
    itemIconToken: "alert-triangle",
    itemIconColor: "var(--color-red-700)",
    actions: [
      { label: "Request updated passport from client",                 urgency: "High" },
      { label: "Obtain Offering Memorandum for BlackRock Institutional", urgency: "High" },
      { label: "Initiate EDD for PEP — L. Fink",                       urgency: "High" },
      { label: "Confirm AUM figure against 2023 Annual Report",         urgency: "Medium" },
    ],
    recommendations: [
      { iconToken: "zap",       text: "Consolidate 3 outstanding document requests into a single client communication to reduce friction." },
      { iconToken: "shield",    text: "Initiate Enhanced Due Diligence for L. Fink before case can proceed to Final Closure." },
      { iconToken: "lightbulb", text: "AUM discrepancy (14%) is within tolerance for interim sign-off but requires notation in the QA record." },
    ],
  },
  "low-confidence": {
    sectionLabel: "Low Confidence Attributes",
    itemIconToken: "trending-down",
    itemIconColor: "var(--color-neutral-700)",
    actions: [
      { label: "Cross-reference AUM figure with Annual Report 2023 to resolve 14% discrepancy", urgency: "High" },
      { label: "Verify PEP status via secondary source (World-Check corroboration)",            urgency: "High" },
      { label: "Confirm UBO cross-reference with Form 13F before QA sign-off",                  urgency: "Medium" },
    ],
    recommendations: [
      { iconToken: "sparkles",  text: "5 attributes fall below the 65% confidence threshold. QA sign-off requires each to reach ≥75% before closure." },
      { iconToken: "zap",       text: "Run multi-source corroboration on AUM and PEP attributes to lift aggregate confidence." },
      { iconToken: "lightbulb", text: "Low confidence on identity attributes is the primary blocker for this case reaching Final Closure." },
    ],
  },
  "needs-review": {
    sectionLabel: "Items Needing Review",
    itemIconToken: "message-circle",
    itemIconColor: "var(--color-dark-blue-600)",
    actions: [
      { label: "Review and resolve entity name mismatch on board resolution (BR-2024-0847)", urgency: "High" },
      { label: "QA sign-off required on PEP determination for L. Fink",                       urgency: "High" },
      { label: "Analyst override on AUM figure requires QA counter-review",                   urgency: "Medium" },
      { label: "UBO cross-reference (Vanguard 35%) requires QA validation",                  urgency: "Medium" },
    ],
    recommendations: [
      { iconToken: "shield",    text: "All 5 review items have analyst overrides. Verify the override rationale is documented before sign-off." },
      { iconToken: "sparkles",  text: "PEP and entity name items carry the highest audit risk — prioritise these for QA review first." },
      { iconToken: "lightbulb", text: "Consider grouping review items by entity to reduce context-switching during the QA session." },
    ],
  },
  "missing-evidence": {
    sectionLabel: "Conflicting Evidence",
    itemIconToken: "file-text",
    itemIconColor: "var(--color-neutral-600)",
    actions: [
      { label: "Issue formal document request for Offering Memorandum — BlackRock Institutional", urgency: "High" },
      { label: "Request UBO declaration for undisclosed minority shareholder",                    urgency: "High" },
    ],
    recommendations: [
      { iconToken: "zap",       text: "Consolidate both document requests into one client-facing communication to minimise friction." },
      { iconToken: "lightbulb", text: "Missing Offering Memorandum is the sole blocker preventing CIP completion for BlackRock Institutional." },
      { iconToken: "shield",    text: "Flag case as Evidence Incomplete in the QA record until both items are received and verified." },
    ],
  },
  exceptions: {
    sectionLabel: "Analyst Exceptions",
    itemIconToken: "flag",
    itemIconColor: "var(--color-red-700)",
    actions: [
      { label: "Review analyst override on entity name — confirm board resolution is acceptable source", urgency: "High" },
      { label: "Validate PEP manual assessment against Refinitiv World-Check result",                   urgency: "High" },
      { label: "Reconcile analyst AUM estimate ($1.85T) with Annual Report figure ($1.62T)",           urgency: "Medium" },
      { label: "Confirm analyst-sourced passport copy meets §4.2 refresh requirement",                  urgency: "Medium" },
      { label: "Validate Form 13F selection over SEC registry for Vanguard UBO",                       urgency: "Low" },
      { label: "Verify client-confirmation source for UBO — Vanguard 35%",                            urgency: "Low" },
    ],
    recommendations: [
      { iconToken: "flag",     text: "6 analyst overrides detected. Each must be individually reviewed and counter-signed before QA approval." },
      { iconToken: "shield",   text: "Entity name and PEP overrides carry the highest compliance risk — resolve these first." },
      { iconToken: "sparkles", text: "Document the rationale for each override in the QA record to satisfy audit trail requirements." },
    ],
  },
};

export const DEFAULT_QA_ENTITIES: readonly string[] = [
  "BlackRock Advisors",
  "BlackRock Institutional",
  "Entity 13",
];

export const QA_ENTITY_TO_SECTION_ID: Record<string, string> = {
  "BlackRock Advisors":      "advisors",
  "BlackRock Institutional": "institutional",
  "Entity 13":               "principal-fink",
};

export function applyFilter(items: AttributeItem[], filter: FilterType): AttributeItem[] {
  switch (filter) {
    case "low-confidence":   return items.filter(i => i.action !== "none" && i.confidence > 0 && i.confidence < 65);
    case "needs-review":     return items.filter(i => i.action === "review");
    case "missing-evidence": return items.filter(i => i.action === "request" || i.confidence === 0);
    case "exceptions":       return items.filter(i => i.action !== "none" && !!i.analystChoice);
    default:                 return items.filter(i => i.action !== "none");
  }
}

export function confidenceColor(c: number): string {
  if (c < 40) return "text-ds-red-700";
  if (c < 65) return "text-ds-neutral-600";
  return "text-ds-green-700";
}

export type FlaggedItemWithContext = AttributeItem & {
  entityName: string;
  section: string;
};

export function getAllFlaggedItems(): FlaggedItemWithContext[] {
  return ENTITY_SECTIONS.flatMap(ent =>
    [...ent.cip, ...ent.dueDiligence].flatMap(sub =>
      sub.items
        .filter(i => i.action !== "none")
        .map(i => ({ ...i, entityName: ent.name.split(" ").slice(0, 2).join(" "), section: sub.title }))
    )
  );
}

export interface QaDashboardViewModel {
  queue: QueueEntry[];
  entitySections: EntitySection[];
  itemDecisions: Record<string, ItemDecision>;
  reviewLenses: ReviewLens[];
  statusConfig: Record<StatusValue, StatusConfigEntry>;
  filters: { id: FilterType; label: string }[];
  filterContent: Record<FilterType, FilterContentEntry>;
  defaultEntities: readonly string[];
  entityToSectionId: Record<string, string>;
}

// TODO: replace with TanStack Query API call
export function getQaDashboardViewModel(): QaDashboardViewModel {
  return {
    queue: QUEUE,
    entitySections: ENTITY_SECTIONS,
    itemDecisions: ITEM_DECISIONS,
    reviewLenses: REVIEW_LENSES,
    statusConfig: STATUS_CONFIG,
    filters: FILTERS,
    filterContent: FILTER_CONTENT,
    defaultEntities: DEFAULT_QA_ENTITIES,
    entityToSectionId: QA_ENTITY_TO_SECTION_ID,
  };
}
