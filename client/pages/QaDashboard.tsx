import { useState, useEffect, useRef } from "react";
import {
  User, ChevronRight, ChevronDown,
  CheckCircle, X, Sparkles, RotateCcw, AlertOctagon,
  Send, ArrowUpRight, Edit2, Trash2, Check,
  FileText, Bot, RefreshCw,
  AlertTriangle, ExternalLink, MessageCircle, Plus, Info, Globe,
  Shield, Users2, Zap, Flag, TrendingDown, ClipboardCheck, Lightbulb, Briefcase, Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "@/components/kyc/TopNav";
import { Button } from "@kpmg-us/ad-design-lib";
import {
  BeneficialOwnersView,
  ENHANCED_OWNERS, type EnhancedOwnerRow,
} from "@/components/kyc/BeneficialOwnersView";

/* ================================================================== */
/*  Types                                                               */
/* ================================================================== */
type RiskFlag     = "high" | "medium" | "low";
type FilterType   = "all" | "low-confidence" | "needs-review" | "missing-evidence" | "exceptions";

interface AttributeItem {
  id:             string;
  name:           string;
  desc:           string;
  confidence:     number;
  action:         "none" | "request" | "review";
  analystChoice?: { label: string; source: string };
  aiOriginal?:    { label: string; source: string };
}

interface Subsection {
  id:             string;
  title:          string;
  attrs:          number;
  verified:       number;
  needReview?:    number;
  missing?:       number;
  items:          AttributeItem[];
  ownerRows?:     EnhancedOwnerRow[];
  hiddenVerified: number;
}

// Placeholder status taxonomy — final values TBD
type StatusValue =
  | "in-review"
  | "action-required"
  | "pending-documents"
  | "on-hold"
  | "ready-for-sign-off";

interface EntitySection {
  id:           string;
  name:         string;
  entityType:   "entity" | "principal" | "beneficial-owner";
  customerType?: string;
  status?:      StatusValue;    // placeholder — taxonomy unresolved
  cip:          Subsection[];
  dueDiligence: Subsection[];
}

interface QueueEntry {
  id:       string;
  entity:   string;
  type:     string;
  risk:     RiskFlag;
  assignee: string;
  due:      string;
}

/* ================================================================== */
/*  DS-aligned card style (mirrors AnalystDashboard)                   */
/* ================================================================== */
const card: React.CSSProperties = {
  background: "var(--color-base-white)",
  border: "1px solid var(--color-neutral-200)",
  borderRadius: "var(--corner-200)",
};

/* ================================================================== */
/*  Queue data                                                          */
/* ================================================================== */
const QUEUE: QueueEntry[] = [
  { id: "q1", entity: "BlackRock Advisors",  type: "AI Evidence Selection",  risk: "high",   assignee: "Alex Smith",  due: "Apr 25" },
  { id: "q2", entity: "State Street Corp",   type: "UBO Determination",      risk: "high",   assignee: "Riley Park",  due: "Apr 25" },
  { id: "q3", entity: "JPMorgan Asset Mgmt", type: "Source of Wealth",       risk: "medium", assignee: "Alex Smith",  due: "Apr 27" },
  { id: "q4", entity: "T. Rowe Price",       type: "PEP Form Sign-off",      risk: "medium", assignee: "Sam Torres",  due: "Apr 28" },
  { id: "q5", entity: "Invesco Ltd.",        type: "Risk Classification",    risk: "low",    assignee: "Jordan Lee",  due: "Apr 30" },
];

/* ================================================================== */
/*  Entity-first attribute data                                         */
/* ================================================================== */
const ENTITY_SECTIONS: EntitySection[] = [
  {
    id: "advisors",
    name: "BlackRock Advisors LLC",
    entityType: "entity",
    customerType: "Registered Investment Adviser",
    status: "action-required" as StatusValue,
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
    status: "pending-documents" as StatusValue,
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
    status: "in-review" as StatusValue,
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

/* ================================================================== */
/*  Decision content per item                                           */
/* ================================================================== */
interface ItemDecision {
  subsection:    string;
  heading:       string;
  description:   string;
  reasoning:     { title: string; text: string; risk: string; source: string };
  options:       { label: string; desc: string }[];
  isMissing?:    boolean;
  aiRecommended?: number;  // index into options[] the AI recommends
  aiRationale?:  string;   // one-line rationale for the recommendation
}

const ITEM_DECISIONS: Record<string, ItemDecision> = {
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

/* ================================================================== */
/*  Review Lens config                                                  */
/* ================================================================== */
const REVIEW_LENSES = [
  {
    id: "areas-of-concern",
    label: "Areas of Concern",
    icon: <Flag size={13} />,
    filterDesc: "Low confidence, overrides, missing data, and flagged attributes",
    reasoning: `Six attributes are flagged across three entities in this case. The most critical cluster sits in entity identification and beneficial ownership — an entity name mismatch on the board resolution, an unresolved UBO declaration, and an expired passport for a named signatory. AUM verification is pending against a 14% discrepancy with the 2023 Annual Report. The missing Offering Memorandum for BlackRock Institutional is the sole remaining blocker for CIP completion. Five attributes fall below the 65% confidence threshold, with three rated under 45%. These findings collectively place the case in an elevated QA scrutiny tier and require resolution before sign-off is permissible.`,
    followUps: [
      {
        q: "Which attribute is highest priority?",
        a: "The entity name mismatch is the highest priority. An email confirmation is not an authoritative source — it must be replaced with a board resolution or SEC EDGAR filing before the case can proceed. Unresolved, it blocks CIP completion and creates downstream risk for all dependent attributes.",
      },
      {
        q: "What's the confidence threshold for sign-off?",
        a: "KPMG QA policy requires all attributes to reach ≥65% confidence before sign-off is permissible. Currently five attributes fall below this threshold, three of which are under 45%. Each must be resolved or formally excepted with documented rationale before the case can close.",
      },
      {
        q: "Can I sign off with outstanding flags?",
        a: "No. Sign-off is not permissible while material flags remain unresolved. You may issue a Rework instruction to the analyst or raise a formal exception for each flag with documented QA rationale. Escalation to a senior reviewer is required for any flag rated Critical or involving PEP/sanctions exposure.",
      },
    ],
  },
  {
    id: "risk-compliance",
    label: "Risk & Compliance",
    icon: <Shield size={13} />,
    filterDesc: "Regulatory exposure, sanctions, AML, and policy adherence",
    reasoning: `This case carries elevated regulatory exposure across two entities. Lawrence D. Fink's active PEP status triggers mandatory Enhanced Due Diligence under FATF Recommendation 12, and the expired passport creates an independent §4.2 refresh requirement. The AUM discrepancy between analyst data and Annual Report 2023 introduces a Source of Wealth validation gap. The missing Offering Memorandum for BlackRock Institutional prevents CIP completion. Taken together, these findings position this case in the High compliance risk tier. QA sign-off requires confirmed resolution of the PEP EDD, passport refresh, and document receipt before closure is permissible.`,
    followUps: [
      {
        q: "What EDD is required for the PEP?",
        a: "For Lawrence D. Fink as an active PEP, EDD must include: source of wealth documentation, enhanced adverse media screening via Dow Jones Factiva, second-level reviewer approval, and re-screening confirmation within the last 12 months. All findings must be recorded in the case file before QA can clear the PEP attribute.",
      },
      {
        q: "Does the expired passport block closure?",
        a: "Yes. An expired government-issued ID cannot satisfy §4.2 identity refresh requirements. The analyst must either obtain a valid replacement document or raise a formal exception approved by a senior compliance officer. The exception must record the expiry date, reason for acceptance, and compensating controls applied.",
      },
      {
        q: "How do I clear the AUM discrepancy?",
        a: "The 14% AUM discrepancy must be resolved against an authoritative external source — SEC Form ADV or the FY2023 Annual Report filed with EDGAR. An analyst note alone does not satisfy CDD evidence standards. Once the correct figure is sourced and documented, the attribute confidence score will update automatically.",
      },
    ],
  },
  {
    id: "customer-experience",
    label: "Customer Experience",
    icon: <Users2 size={13} />,
    filterDesc: "Client friction, documentation burden, and relationship risk",
    reasoning: `The current documentation burden for this client is above average for a periodic refresh. Three separate document requests are outstanding — an updated passport, an Offering Memorandum, and UBO corroboration — which increases the risk of client fatigue and delayed response. The entity name mismatch on the board resolution may signal outdated client records and could require a sensitive communication via the Relationship Manager to avoid escalating friction. Recommend consolidating all outstanding requests into a single client communication and flagging for Relationship Risk review before issuing any further outreach.`,
    followUps: [
      {
        q: "How should I consolidate client requests?",
        a: "Coordinate with the Relationship Manager to bundle all three outstanding requests — passport refresh, Offering Memorandum, and UBO corroboration — into a single client communication. Staggered or duplicated outreach significantly increases client fatigue and response time. A single, clearly scoped request with a defined response deadline is the recommended approach.",
      },
      {
        q: "What's the risk of client non-response?",
        a: "If the client does not respond within the SLA window (typically 14 days for periodic refresh), the case must be escalated under the Non-Responsive Client procedure. The Relationship Manager must be notified, and if no response is received after a second request, the account may be subject to a restriction hold pending Compliance review.",
      },
      {
        q: "Should the RM be looped in now?",
        a: "Yes — given the volume and sensitivity of outstanding requests, Relationship Manager involvement is recommended before any further client outreach. The RM can assess the client's current engagement level, advise on tone and timing, and help pre-empt friction around the entity name clarification, which is the most sensitive of the three gaps.",
      },
    ],
  },
  {
    id: "sales-relationship",
    label: "Sales / Relationship",
    icon: <Briefcase size={13} />,
    filterDesc: "Commercial sensitivity, deal risk, and relationship manager considerations",
    reasoning: `BlackRock is a strategically significant client with a complex multi-entity DRG structure. The current case has three outstanding document requests — any of which could generate friction if not handled carefully. The passport expiry for Lawrence D. Fink is likely known to the client and should be framed as a routine compliance refresh rather than an escalation. The missing Offering Memorandum for BlackRock Institutional represents the most commercially sensitive gap; a delay here risks disrupting the periodic refresh cycle and creating a hold on client services. Recommend looping in the Relationship Manager before issuing formal document requests, and coordinating outreach timing to avoid competing communications. AUM discrepancy should be resolved internally where possible before client contact.`,
    followUps: [
      {
        q: "Is there a hold risk on client services?",
        a: "Yes. The missing Offering Memorandum for BlackRock Institutional is the primary service-hold risk. Until CIP is complete for that entity, any new product subscriptions or account amendments under the institutional structure may be blocked. The RM should be made aware so they can manage client expectations and timeline accordingly.",
      },
      {
        q: "How do I frame the passport request?",
        a: "Frame the passport refresh as a routine periodic compliance update rather than a new or escalated requirement. Suggested language: 'As part of our standard periodic refresh, we require an updated copy of the government-issued ID on file for [name]. This is a routine requirement and does not affect your current services.' Avoid referencing expiry dates or policy breaches in the initial outreach.",
      },
      {
        q: "Can the AUM discrepancy be resolved internally?",
        a: "Yes, in most cases. The AUM discrepancy should first be checked against EDGAR Form ADV and the FY2023 Annual Report before initiating any client contact. If the correct figure can be sourced and verified internally, no client outreach is required. Client contact should only be initiated if the discrepancy cannot be reconciled from public filings.",
      },
    ],
  },
  {
    id: "analyst-overrides",
    label: "Analyst Overrides",
    icon: <TrendingDown size={13} />,
    filterDesc: "Attributes where the analyst has overridden the AI selection",
    reasoning: `Six analyst overrides have been recorded across this case. The most significant are in entity identification — the analyst accepted an email confirmation to resolve an entity name mismatch instead of the board resolution, and manually confirmed a PEP determination against the AI-recommended Refinitiv World-Check source. AUM figures were adjusted from the Annual Report 2023 baseline without a corroborating source. Each override requires an explicit QA counter-review and documented rationale before the case can proceed to sign-off. Cross-entity consistency should be validated to ensure override decisions are not in conflict across BlackRock Advisors and BlackRock Institutional.`,
    followUps: [
      {
        q: "Do all overrides need QA rationale?",
        a: "Yes. Every analyst override must have an explicit QA counter-review note recorded in the case file. The note must state: the original AI determination, the analyst's override reason, the QA reviewer's assessment, and the final accepted decision. Cases with undocumented overrides cannot be closed.",
      },
      {
        q: "Which override is highest risk?",
        a: "The entity name override is highest risk. Accepting an email confirmation in place of a board resolution or SEC filing introduces a material evidence gap. If challenged by an auditor or regulator, this override has the weakest defensibility of the six. QA should instruct rework to replace the email with an authoritative source before proceeding.",
      },
      {
        q: "How do I check cross-entity consistency?",
        a: "Compare the override decisions recorded for BlackRock Advisors LLC against those for BlackRock Institutional. Any attribute that has been resolved differently across entities in the same DRG — particularly AUM, UBO, or entity name — requires a documented reconciliation note explaining why the treatment differs and confirming it is intentional and policy-compliant.",
      },
    ],
  },
];

/* ================================================================== */
/*  Placeholder StatusPill                                              */
/*  Neutral styling — final taxonomy is unresolved                      */
/* ================================================================== */
const STATUS_CONFIG: Record<StatusValue, { label: string; dot: string; text: string; bg: string; border: string }> = {
  "in-review":          { label: "In Review",          dot: "var(--color-dark-blue-600)", text: "var(--color-dark-blue-600)", bg: "var(--color-dark-blue-000)",  border: "var(--color-dark-blue-100)" },
  "action-required":    { label: "Action Required",    dot: "var(--color-red-700)",       text: "var(--color-red-700)",       bg: "var(--color-red-000)",        border: "var(--color-red-200)"        },
  "pending-documents":  { label: "Pending Documents",  dot: "var(--color-yellow-600)",    text: "var(--color-neutral-900)",   bg: "var(--color-yellow-000)",     border: "var(--color-yellow-300)"    },
  "on-hold":            { label: "On Hold",            dot: "var(--color-neutral-500)",   text: "var(--color-neutral-600)",   bg: "var(--color-neutral-100)",    border: "var(--color-neutral-300)"   },
  "ready-for-sign-off": { label: "Ready for Sign-off", dot: "var(--color-green-700)",     text: "var(--color-green-700)",     bg: "var(--color-green-000)",      border: "var(--color-green-100)"     },
};

function StatusPill({ status, size = "sm" }: { status: StatusValue; size?: "xs" | "sm" }) {
  const cfg = STATUS_CONFIG[status];
  const textSize = size === "xs" ? "text-[9px]" : "text-[10px]";
  const dotSize  = size === "xs" ? "w-1 h-1"   : "w-1.5 h-1.5";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${textSize}`}
      style={{
        background: cfg.bg,
        border: `1px dashed ${cfg.border}`,  /* dashed = placeholder signal */
        color: cfg.text,
        padding: size === "xs" ? "1px 6px" : "2px 8px",
      }}
      title="Status taxonomy is a placeholder — final values TBD"
    >
      <span className={`rounded-full shrink-0 ${dotSize}`} style={{ background: cfg.dot }} aria-hidden />
      {cfg.label}
    </span>
  );
}

/* ================================================================== */
/*  Filter helpers                                                      */
/* ================================================================== */
const FILTERS: { id: FilterType; label: string }[] = [
  { id: "all",              label: "All Flagged" },
  { id: "low-confidence",   label: "Low Confidence" },
  { id: "needs-review",     label: "Needs Review" },
  { id: "missing-evidence", label: "Conflicting Evidence" },
  { id: "exceptions",       label: "Exceptions" },
];

function applyFilter(items: AttributeItem[], filter: FilterType): AttributeItem[] {
  switch (filter) {
    case "low-confidence":   return items.filter(i => i.action !== "none" && i.confidence > 0 && i.confidence < 65);
    case "needs-review":     return items.filter(i => i.action === "review");
    case "missing-evidence": return items.filter(i => i.action === "request" || i.confidence === 0);
    case "exceptions":       return items.filter(i => i.action !== "none" && !!i.analystChoice);
    default:                 return items.filter(i => i.action !== "none");
  }
}

/* ================================================================== */
/*  Helpers                                                             */
/* ================================================================== */
function confidenceColor(c: number) {
  if (c < 40) return "text-ds-red-700";
  if (c < 65) return "text-ds-neutral-600";
  return "text-ds-green-700";
}

function getAllFlaggedItems(): (AttributeItem & { entityName: string; section: string })[] {
  return ENTITY_SECTIONS.flatMap(ent =>
    [...ent.cip, ...ent.dueDiligence].flatMap(sub =>
      sub.items
        .filter(i => i.action !== "none")
        .map(i => ({ ...i, entityName: ent.name.split(" ").slice(0, 2).join(" "), section: sub.title }))
    )
  );
}

/* ================================================================== */
/*  QA Review sub-header                                                */
/* ================================================================== */
function QaReviewHeader({ entry: _entry }: { entry: QueueEntry }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white">
      <div className="px-4 py-2 border-b border-kyc-neutral-200 bg-white flex items-center gap-0 min-w-0">

        {/* Scrollable metadata strip */}
        <div className="flex items-center min-w-0 overflow-x-auto flex-1" style={{ scrollbarWidth: "none" }}>

          {/* DRG */}
          <div className="shrink-0 px-2">
            <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-700 mb-1">DRG</p>
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-semibold text-kyc-neutral-700 truncate max-w-[180px] leading-none">BlackRock DRG Group</p>
              <Info size={13} className="text-kyc-neutral-600 shrink-0" />
            </div>
          </div>

          <div className="shrink-0 self-stretch w-px bg-kyc-neutral-200 mx-4" />

          {/* Status */}
          <div className="shrink-0 px-2">
            <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-700 mb-1">Status</p>
            <StatusPill status="in-review" />
          </div>

          <div className="shrink-0 self-stretch w-px bg-kyc-neutral-200 mx-4" />

          {/* Risk */}
          <div className="shrink-0 px-2">
            <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-700 mb-1">Risk</p>
            <span className="flex items-center gap-1 text-[12px] font-semibold text-kyc-neutral-700">
              Elevated <AlertTriangle size={13} className="text-ds-red-700" />
            </span>
          </div>

          <div className="shrink-0 self-stretch w-px bg-kyc-neutral-200 mx-4" />

          {/* Priority */}
          <div className="shrink-0 px-2">
            <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-700 mb-1">Priority</p>
            <span className="flex items-center gap-1 text-[12px] font-semibold text-kyc-neutral-700">
              High <ArrowUpRight size={13} className="text-ds-red-700" />
            </span>
          </div>

          <div className="shrink-0 self-stretch w-px bg-kyc-neutral-200 mx-4" />

          {/* Customer Type */}
          <div className="shrink-0 px-2">
            <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-700 mb-1">Customer Type</p>
            <span className="text-[12px] font-semibold text-kyc-neutral-700">Complex Ownership</span>
          </div>

          <div className="shrink-0 self-stretch w-px bg-kyc-neutral-200 mx-4" />

          {/* Jurisdiction */}
          <div className="shrink-0 px-2">
            <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-700 mb-1">Jurisdiction</p>
            <span className="flex items-center gap-1 text-[12px] font-semibold text-kyc-neutral-700">
              <Globe size={13} className="text-kyc-neutral-600 shrink-0" /> New York, USA
            </span>
          </div>

          <div className="shrink-0 self-stretch w-px bg-kyc-neutral-200 mx-4" />

          {/* Exceptions */}
          <div className="shrink-0 px-2">
            <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-700 mb-1">Exceptions</p>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-kyc-neutral-700">
                0<span className="text-[11px] font-normal text-kyc-neutral-600">/5</span>
              </span>
              <span className="text-[10.5px] text-kyc-neutral-700">addressed</span>
            </div>
          </div>

          <div className="shrink-0 self-stretch w-px bg-kyc-neutral-200 mx-4" />

          {/* Due Date */}
          <div className="shrink-0 px-2">
            <p className="text-[9px] font-semibold tracking-widest uppercase text-kyc-neutral-700 mb-1">Due Date</p>
            <span className="text-[12px] font-semibold text-ds-red-700">Apr 25, 2026</span>
          </div>

        </div>

        {/* Actions — always pinned to the right */}
        <div className="shrink-0 flex items-center gap-2 pl-4 ml-2 border-l border-kyc-neutral-200">
          <Button variant="text" size="small" label="Cancel" showIconTrailing icon={<X size={13} />} onClick={() => navigate("/qa-work-hub")} />
          <Button variant="outlined" size="small" label="Escalate" showIconTrailing icon={<AlertOctagon size={13} />} />
          <Button variant="outlined" size="small" label="Rework" showIconTrailing icon={<RotateCcw size={13} />} />
          <Button variant="filled" size="small" label="Submit" showIconTrailing icon={<Send size={13} />} />
        </div>

      </div>
    </div>
  );
}

/* ================================================================== */
/*  Review Lens Panel                                                   */
/* ================================================================== */
function ReviewLensPanel({ lens, onChangeLens }: { lens: string; onChangeLens: (l: string) => void }) {
  const active = REVIEW_LENSES.find(l => l.id === lens) ?? REVIEW_LENSES[0];
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [, setActiveQ]   = useState<string | null>(null);
  const [, setLoadingQ]  = useState<string | null>(null);
  const [, setAnsweredQ] = useState<string | null>(null);

  const handleChangeLens = (id: string) => {
    if (id === lens) return;
    setIsAnalyzing(true);
    setActiveQ(null);
    setAnsweredQ(null);
    setLoadingQ(null);
    onChangeLens(id);
    setTimeout(() => setIsAnalyzing(false), 1100);
  };

  const handleRefresh = () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setActiveQ(null);
    setAnsweredQ(null);
    setLoadingQ(null);
    setTimeout(() => setIsAnalyzing(false), 1400);
  };


  return (
    <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--color-neutral-200)", background: "var(--color-base-white)" }}>

      {/* Label */}
      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles size={11} style={{ color: "var(--color-dark-blue-600)" }} aria-hidden />
        <h3 className="text-[13px] font-bold" style={{ color: "var(--color-neutral-900)" }}>Review Lens</h3>
      </div>
      {/* Design note */}
      <p className="text-[10px] mb-2 leading-snug" style={{ color: "var(--color-neutral-700)" }}>
        Provides additional analytical perspectives — not a filter. Content remains the same; the AI assessment adapts to the selected lens.
      </p>

      {/* Dropdown */}
      <div className="relative mb-2.5">
        <label htmlFor="review-lens-select" className="sr-only">Review Lens</label>
        <select
          id="review-lens-select"
          value={lens}
          onChange={e => handleChangeLens(e.target.value)}
          aria-label="Select review lens"
          className="w-full appearance-none text-[12px] font-medium pl-3 pr-8 py-1.5 cursor-pointer transition-all focus-visible:outline-none"
          style={{
            background: "var(--color-base-white)",
            border: "1px solid var(--color-neutral-300)",
            borderRadius: "var(--corner-100)",
            color: "var(--color-neutral-900)",
          }}
          onFocus={e => { e.currentTarget.style.outline = "2px solid var(--color-dark-blue-600)"; e.currentTarget.style.outlineOffset = "2px"; }}
          onBlur={e => { e.currentTarget.style.outline = "none"; }}
        >
          {REVIEW_LENSES.map(l => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>
        <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-neutral-500)" }} aria-hidden />
      </div>

      {/* AI assessment */}
      <div className="rounded-lg p-3 text-[10px] leading-relaxed" style={{ background: "var(--color-dark-blue-000)", border: "1px solid var(--color-dark-blue-100)", color: "var(--color-neutral-700)" }}>
        <div className="flex items-center gap-1.5 mb-1.5">
          {isAnalyzing
            ? <Loader2 size={10} className="animate-spin" style={{ color: "var(--color-dark-blue-600)" }} aria-hidden />
            : <Bot size={10} style={{ color: "var(--color-dark-blue-600)" }} aria-hidden />
          }
          <span className="text-[9px] font-bold uppercase tracking-widest flex-1" style={{ color: "var(--color-dark-blue-600)" }}>
            {isAnalyzing ? `Running ${active.label} agent…` : `AI Assessment · ${active.label}`}
          </span>
          {!isAnalyzing && (
            <button
              onClick={handleRefresh}
              aria-label="Refresh AI assessment"
              className="shrink-0 p-0.5 rounded transition-colors"
              style={{ color: "var(--color-dark-blue-400)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-dark-blue-600)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-dark-blue-400)")}
            >
              <RefreshCw size={10} aria-hidden />
            </button>
          )}
        </div>
        {isAnalyzing ? (
          <div className="space-y-1.5 animate-pulse">
            <div className="h-2 rounded" style={{ background: "var(--color-dark-blue-100)", width: "90%" }} />
            <div className="h-2 rounded" style={{ background: "var(--color-dark-blue-100)", width: "100%" }} />
            <div className="h-2 rounded" style={{ background: "var(--color-dark-blue-100)", width: "75%" }} />
            <div className="h-2 rounded" style={{ background: "var(--color-dark-blue-100)", width: "85%" }} />
          </div>
        ) : (
          <p>{active.reasoning}</p>
        )}
      </div>

      {/* Follow-up questions — hidden for now */}

    </div>
  );
}

/* ================================================================== */
/*  Subsection row                                                      */
/* ================================================================== */
function SubsectionRow({
  sub, expanded, selectedItemId, onToggle, onSelectItem, onSelectOwner, selectedOwnerId, filter,
}: {
  sub: Subsection; expanded: boolean; selectedItemId: string | null; selectedOwnerId: string | null;
  onToggle: () => void; onSelectItem: (id: string) => void; onSelectOwner: (id: string) => void;
  filter: FilterType;
}) {
  const isTableMode    = !!sub.ownerRows;
  // Verified attributes — always visible
  const verifiedItems  = sub.items.filter(i => i.action === "none");
  // Flagged items — filtered by the active chip
  const filteredFlagged = applyFilter(sub.items, filter);
  const allFlagged      = sub.items.filter(i => i.action !== "none");
  const hasIssues       = allFlagged.length > 0 || (sub.missing ?? 0) > 0 || (sub.needReview ?? 0) > 0;
  const matchCount      = filteredFlagged.length + (sub.needReview ?? 0);

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`subsection-panel-${sub.title.replace(/\s+/g, "-")}`}
        className="w-full flex items-center gap-2 px-4 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        style={{ borderBottom: "1px solid var(--color-neutral-100)", outlineColor: "var(--color-dark-blue-600)" }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--color-neutral-000)")}
        onMouseLeave={e => (e.currentTarget.style.background = "")}
      >
        {expanded
          ? <ChevronDown size={10} style={{ color: "var(--color-neutral-500)" }} className="shrink-0" aria-hidden />
          : <ChevronRight size={10} style={{ color: "var(--color-neutral-500)" }} className="shrink-0" aria-hidden />}
        <span className="text-[11px] font-semibold" style={{ color: "var(--color-neutral-700)" }}>{sub.title}</span>
        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "var(--color-neutral-100)", color: "var(--color-neutral-500)" }} aria-hidden>{sub.attrs}</span>
        <div className="flex-1" />
        {hasIssues && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ color: "var(--color-red-700)", background: "var(--color-red-000)", border: "1px solid var(--color-red-200)" }} aria-label={`${matchCount > 0 ? matchCount : allFlagged.length} flagged items`}>
            {matchCount > 0 ? `${matchCount} flagged` : `${allFlagged.length} flagged`}
          </span>
        )}
      </button>
      {expanded && (
        <div id={`subsection-panel-${sub.title.replace(/\s+/g, "-")}`} style={{ borderBottom: "1px solid var(--color-neutral-100)" }}>
          {isTableMode ? (
            <BeneficialOwnersView rows={sub.ownerRows!} selectedId={selectedOwnerId} onSelect={onSelectOwner} />
          ) : (
            <>
              {/* Flagged items — filtered by active chip */}
              {filteredFlagged.map(item => {
                const isSelected = item.id === selectedItemId;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectItem(item.id)}
                    className="w-full text-left flex items-start justify-between gap-3 px-6 py-2.5 transition-colors"
                    style={{
                      borderBottom: "1px solid var(--color-neutral-100)",
                      borderLeft: isSelected ? "3px solid var(--color-dark-blue-600)" : "3px solid transparent",
                      background: isSelected ? "var(--color-dark-blue-000)" : "var(--color-base-white)",
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--color-neutral-000)"; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "var(--color-base-white)"; }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold leading-tight" style={{ color: isSelected ? "var(--color-dark-blue-600)" : "var(--color-neutral-800)" }}>{item.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--color-neutral-600)" }}>{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                      {item.confidence > 0 && (
                        <span className={`text-[10px] font-semibold ${confidenceColor(item.confidence)}`}>{item.confidence}%</span>
                      )}
                      <span className="text-[9px] font-semibold rounded-full px-2 py-0.5" style={{ border: "1px solid var(--color-neutral-300)", color: "var(--color-neutral-700)" }}>Resolve</span>
                    </div>
                  </button>
                );
              })}
              {/* No matches message */}
              {filteredFlagged.length === 0 && allFlagged.length > 0 && (
                <p className="px-6 py-2 text-[10px] italic" style={{ color: "var(--color-neutral-400)" }}>No {filter === "all" ? "flagged" : filter.replace("-", " ")} items in this section</p>
              )}
              {/* Divider before verified items */}
              {verifiedItems.length > 0 && (
                <div className="flex items-center gap-2 px-6 py-1" style={{ borderTop: filteredFlagged.length > 0 ? "1px solid var(--color-neutral-100)" : undefined }}>
                  <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-neutral-600)" }}>Verified · {verifiedItems.length}</span>
                </div>
              )}
              {/* Verified attributes — always shown, non-clickable */}
              {verifiedItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-6 py-1.5"
                  style={{ borderBottom: "1px solid var(--color-neutral-100)", borderLeft: "3px solid transparent" }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <CheckCircle size={10} style={{ color: "var(--color-green-700)", flexShrink: 0 }} aria-hidden />
                    <p className="text-[10.5px] truncate" style={{ color: "var(--color-neutral-700)" }}>{item.name}</p>
                    <p className="text-[10px] truncate hidden sm:block" style={{ color: "var(--color-neutral-700)" }}>{item.desc}</p>
                  </div>
                  <span className="text-[10px] font-semibold shrink-0" style={{ color: "var(--color-green-700)" }}>{item.confidence}%</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Entity Accordion                                                    */
/* ================================================================== */
function EntityAccordion({
  entity, expandedSubs, selectedItemId, selectedOwnerId, onToggleSub, onSelectItem, onSelectOwner, filter,
}: {
  entity: EntitySection; expandedSubs: Set<string>; selectedItemId: string | null; selectedOwnerId: string | null;
  onToggleSub: (id: string) => void; onSelectItem: (id: string) => void; onSelectOwner: (id: string) => void;
  filter: FilterType;
}) {
  return (
    <div>
      {[...entity.cip, ...entity.dueDiligence].map(sub => (
        <SubsectionRow
          key={sub.id} sub={sub} expanded={expandedSubs.has(sub.id)}
          selectedItemId={selectedItemId} selectedOwnerId={selectedOwnerId}
          onToggle={() => onToggleSub(sub.id)} onSelectItem={onSelectItem} onSelectOwner={onSelectOwner}
          filter={filter}
        />
      ))}
    </div>
  );
}

/* ================================================================== */
/*  Agent Reasoning box                                                 */
/* ================================================================== */
function AgentReasoningBox({ reasoning }: { reasoning: ItemDecision["reasoning"] }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div>
      <button onClick={() => setExpanded(v => !v)} aria-expanded={expanded} className="w-full flex items-center gap-2 py-1.5 mb-2">
        <Bot size={12} style={{ color: "var(--color-dark-blue-600)" }} aria-hidden />
        <span className="text-[13px] font-bold flex-1 text-left" style={{ color: "var(--color-neutral-900)" }}>Agent Reasoning</span>
        <ChevronDown size={11} className={`transition-transform ${expanded ? "rotate-180" : ""}`} style={{ color: "var(--color-neutral-500)" }} aria-hidden />
      </button>
      {expanded && (
        <div className="rounded-lg p-3 space-y-2 text-[10px] leading-[1.55]" style={{ background: "var(--color-neutral-000)", border: "1px solid var(--color-neutral-200)" }}>
          <p className="font-semibold" style={{ color: "var(--color-neutral-900)" }}>{reasoning.title}</p>
          <p style={{ color: "var(--color-neutral-700)" }}><span className="font-semibold" style={{ color: "var(--color-neutral-800)" }}>Reasoning: </span>{reasoning.text}</p>
          <p style={{ color: "var(--color-neutral-700)" }}><span className="font-semibold" style={{ color: "var(--color-neutral-800)" }}>Flagged for Risk: </span>{reasoning.risk}</p>
          <a href="#source" className="flex items-center gap-1.5 font-medium mt-1 hover:underline" style={{ color: "var(--color-dark-blue-600)" }}>
            <FileText size={10} className="shrink-0" />Source: {reasoning.source}<ExternalLink size={9} style={{ color: "var(--color-neutral-500)" }} />
          </a>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Decision Panel (selected-item detail)                               */
/* ================================================================== */
function DecisionPanel({ decision }: { decision: ItemDecision }) {
  const [choice,   setChoice]   = useState<number | null>(null);
  const [followUp, setFollowUp] = useState("");
  const [showCaps, setShowCaps] = useState(false);

  const caps = ["Summarise conflicting evidence sources", "Compare OCR quality across documents", "Flag regulatory precedent for this attribute", "Draft feedback note to analyst", "Check cross-entity consistency"];
  const aiRec = decision.aiRecommended;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "var(--color-base-white)" }}>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
        <p className="text-[11px] leading-relaxed" style={{ color: "var(--color-neutral-700)" }}>{decision.description}</p>
        <AgentReasoningBox reasoning={decision.reasoning} />
        <div>
          <p className="text-[11px] font-semibold mb-2" style={{ color: "var(--color-neutral-900)" }}>How would you like to resolve this?</p>
          <div className="space-y-2">
            {decision.options.map((opt, i) => {
              const isAiRec  = i === aiRec;
              const isChosen = choice === i;
              return (
                <button key={i} onClick={() => setChoice(i)}
                  className="w-full text-left p-3 rounded-lg transition-all"
                  style={{
                    border: isChosen
                      ? "2px solid var(--color-dark-blue-600)"
                      : isAiRec
                      ? "2px solid var(--color-dark-blue-200)"
                      : "2px solid var(--color-neutral-200)",
                    background: isChosen ? "var(--color-dark-blue-000)" : "var(--color-base-white)",
                  }}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-[11px] font-semibold" style={{ color: "var(--color-neutral-900)" }}>{opt.label}</p>
                    {isAiRec && (
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "var(--color-dark-blue-000)", color: "var(--color-dark-blue-600)", border: "1px solid var(--color-dark-blue-100)" }}>
                        <Sparkles size={7} aria-hidden /> AI Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] leading-snug" style={{ color: "var(--color-neutral-600)" }}>{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--color-neutral-200)" }}>
          <textarea value={followUp} onChange={e => setFollowUp(e.target.value)} placeholder="Ask a follow up question" rows={3}
            className="w-full px-4 pt-3 pb-2 text-[11px] resize-none outline-none"
            style={{ background: "var(--color-base-white)", color: "var(--color-neutral-800)" }} />
          <div className="flex items-center justify-between px-3 py-2" style={{ borderTop: "1px solid var(--color-neutral-100)", background: "var(--color-neutral-000)" }}>
            <button onClick={() => setShowCaps(v => !v)} className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "var(--color-dark-blue-600)" }}>
              <Sparkles size={10} aria-hidden /> More AI capabilities
            </button>
            <button disabled={!followUp.trim()} className="w-7 h-7 flex items-center justify-center text-white rounded-lg disabled:opacity-30"
              style={{ background: "var(--color-dark-blue-600)" }}><Send size={11} /></button>
          </div>
        </div>
        {showCaps && (
          <div className="space-y-1.5">
            {caps.map((c, i) => (
              <button key={i} onClick={() => setFollowUp(c)} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] transition-colors"
                style={{ border: "1px solid var(--color-neutral-200)", color: "var(--color-neutral-700)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--color-neutral-000)")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}>
                <Sparkles size={9} style={{ color: "var(--color-dark-blue-600)" }} className="shrink-0" />{c}
              </button>
            ))}
          </div>
        )}
      </div>
      {choice !== null && (
        <div className="shrink-0 px-5 py-3 flex flex-col gap-1.5" style={{ borderTop: "1px solid var(--color-neutral-200)" }}>
          <Button
            variant="filled"
            size="small"
            label="Resolved"
            icon={<Check size={13} />}
          />
          <Button
            variant="outlined"
            size="small"
            label="Confirm & Sign off"
            icon={<CheckCircle size={13} />}
          />
          <Button
            variant="text"
            size="small"
            label="Return to Revision"
            icon={<RotateCcw size={13} />}
          />
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Filter-driven content config                                        */
/* ================================================================== */
const FILTER_CONTENT: Record<FilterType, {
  sectionLabel:   string;
  itemIcon:       React.ReactNode;
  itemIconColor:  string;
  actions:        { label: string; urgency: "High" | "Medium" | "Low" }[];
  recommendations: { icon: React.ReactNode; text: string }[];
}> = {
  all: {
    sectionLabel: "All Flagged Attributes",
    itemIcon: <AlertTriangle size={11} />, itemIconColor: "var(--color-red-700)",
    actions: [
      { label: "Request updated passport from client",                 urgency: "High" },
      { label: "Obtain Offering Memorandum for BlackRock Institutional", urgency: "High" },
      { label: "Initiate EDD for PEP — L. Fink",                       urgency: "High" },
      { label: "Confirm AUM figure against 2023 Annual Report",         urgency: "Medium" },
    ],
    recommendations: [
      { icon: <Zap size={11} />,      text: "Consolidate 3 outstanding document requests into a single client communication to reduce friction." },
      { icon: <Shield size={11} />,   text: "Initiate Enhanced Due Diligence for L. Fink before case can proceed to Final Closure." },
      { icon: <Lightbulb size={11} />, text: "AUM discrepancy (14%) is within tolerance for interim sign-off but requires notation in the QA record." },
    ],
  },
  "low-confidence": {
    sectionLabel: "Low Confidence Attributes",
    itemIcon: <TrendingDown size={11} />, itemIconColor: "var(--color-neutral-700)",
    actions: [
      { label: "Cross-reference AUM figure with Annual Report 2023 to resolve 14% discrepancy", urgency: "High" },
      { label: "Verify PEP status via secondary source (World-Check corroboration)",            urgency: "High" },
      { label: "Confirm UBO cross-reference with Form 13F before QA sign-off",                  urgency: "Medium" },
    ],
    recommendations: [
      { icon: <Sparkles size={11} />, text: "5 attributes fall below the 65% confidence threshold. QA sign-off requires each to reach ≥75% before closure." },
      { icon: <Zap size={11} />,      text: "Run multi-source corroboration on AUM and PEP attributes to lift aggregate confidence." },
      { icon: <Lightbulb size={11} />, text: "Low confidence on identity attributes is the primary blocker for this case reaching Final Closure." },
    ],
  },
  "needs-review": {
    sectionLabel: "Items Needing Review",
    itemIcon: <MessageCircle size={11} />, itemIconColor: "var(--color-dark-blue-600)",
    actions: [
      { label: "Review and resolve entity name mismatch on board resolution (BR-2024-0847)", urgency: "High" },
      { label: "QA sign-off required on PEP determination for L. Fink",                       urgency: "High" },
      { label: "Analyst override on AUM figure requires QA counter-review",                   urgency: "Medium" },
      { label: "UBO cross-reference (Vanguard 35%) requires QA validation",                  urgency: "Medium" },
    ],
    recommendations: [
      { icon: <Shield size={11} />,   text: "All 5 review items have analyst overrides. Verify the override rationale is documented before sign-off." },
      { icon: <Sparkles size={11} />, text: "PEP and entity name items carry the highest audit risk — prioritise these for QA review first." },
      { icon: <Lightbulb size={11} />, text: "Consider grouping review items by entity to reduce context-switching during the QA session." },
    ],
  },
  "missing-evidence": {
    sectionLabel: "Conflicting Evidence",
    itemIcon: <FileText size={11} />, itemIconColor: "var(--color-neutral-600)",
    actions: [
      { label: "Issue formal document request for Offering Memorandum — BlackRock Institutional", urgency: "High" },
      { label: "Request UBO declaration for undisclosed minority shareholder",                    urgency: "High" },
    ],
    recommendations: [
      { icon: <Zap size={11} />,      text: "Consolidate both document requests into one client-facing communication to minimise friction." },
      { icon: <Lightbulb size={11} />, text: "Missing Offering Memorandum is the sole blocker preventing CIP completion for BlackRock Institutional." },
      { icon: <Shield size={11} />,   text: "Flag case as Evidence Incomplete in the QA record until both items are received and verified." },
    ],
  },
  exceptions: {
    sectionLabel: "Analyst Exceptions",
    itemIcon: <Flag size={11} />, itemIconColor: "var(--color-red-700)",
    actions: [
      { label: "Review analyst override on entity name — confirm board resolution is acceptable source", urgency: "High" },
      { label: "Validate PEP manual assessment against Refinitiv World-Check result",                   urgency: "High" },
      { label: "Reconcile analyst AUM estimate ($1.85T) with Annual Report figure ($1.62T)",           urgency: "Medium" },
      { label: "Confirm analyst-sourced passport copy meets §4.2 refresh requirement",                  urgency: "Medium" },
      { label: "Validate Form 13F selection over SEC registry for Vanguard UBO",                       urgency: "Low" },
      { label: "Verify client-confirmation source for UBO — Vanguard 35%",                            urgency: "Low" },
    ],
    recommendations: [
      { icon: <Flag size={11} />,     text: "6 analyst overrides detected. Each must be individually reviewed and counter-signed before QA approval." },
      { icon: <Shield size={11} />,   text: "Entity name and PEP overrides carry the highest compliance risk — resolve these first." },
      { icon: <Sparkles size={11} />, text: "Document the rationale for each override in the QA record to satisfy audit trail requirements." },
    ],
  },
};

/* ================================================================== */
/*  Action / Resolution Panel — helpers                                 */
/* ================================================================== */
function RightPanelSection({
  title, count, open, onToggle, countStyle, icon, children,
}: {
  title: string; count: number; open: boolean; onToggle: () => void;
  countStyle?: React.CSSProperties; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--color-neutral-200)" }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`right-panel-${title.replace(/\s+/g, "-")}`}
        className="w-full flex items-center gap-2 px-3 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        style={{ background: "var(--color-neutral-000)", borderBottom: open ? "1px solid var(--color-neutral-200)" : "none", outlineColor: "var(--color-dark-blue-600)" }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--color-neutral-100)")}
        onMouseLeave={e => (e.currentTarget.style.background = "var(--color-neutral-000)")}
      >
        <span style={{ color: "var(--color-neutral-500)" }} aria-hidden>{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest flex-1 text-left" style={{ color: "var(--color-neutral-700)" }}>{title}</span>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={countStyle ?? { background: "var(--color-neutral-100)", color: "var(--color-neutral-600)" }} aria-label={`${count} items`}>{count}</span>
        {open
          ? <ChevronDown size={11} style={{ color: "var(--color-neutral-500)" }} aria-hidden />
          : <ChevronRight size={11} style={{ color: "var(--color-neutral-500)" }} aria-hidden />
        }
      </button>
      {open && <div id={`right-panel-${title.replace(/\s+/g, "-")}`} className="px-3 py-2.5 space-y-1.5">{children}</div>}
    </div>
  );
}

function FlaggedItemRow({ item, onSelect }: { item: AttributeItem & { entityName: string; section: string }; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left flex items-start gap-2 p-2.5 rounded-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
      style={{ border: "1px solid var(--color-neutral-200)", background: "var(--color-base-white)", outlineColor: "var(--color-dark-blue-600)" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-dark-blue-400)"; e.currentTarget.style.background = "var(--color-dark-blue-000)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-neutral-200)"; e.currentTarget.style.background = "var(--color-base-white)"; }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold truncate" style={{ color: "var(--color-neutral-800)" }}>{item.name}</p>
        <p className="text-[9.5px] mt.0.5" style={{ color: "var(--color-neutral-700)" }}>{item.entityName} · {item.section}</p>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        {item.confidence > 0 && (
          <span className={`text-[10px] font-bold ${confidenceColor(item.confidence)}`}>{item.confidence}%</span>
        )}
        <span className="text-[9px] font-semibold" style={{ color: "var(--color-dark-blue-600)" }}>Resolve →</span>
      </div>
    </button>
  );
}

/* ================================================================== */
/*  Action / Resolution Panel (overview, no item selected)             */
/* ================================================================== */
function ActionResolutionPanel({ onSelectItem, activeFilter }: { onSelectItem: (id: string) => void; activeFilter: FilterType }) {
  const allItems = ENTITY_SECTIONS.flatMap(ent =>
    [...ent.cip, ...ent.dueDiligence].flatMap(sub =>
      sub.items.map(i => ({ ...i, entityName: ent.name.split(" ").slice(0, 2).join(" "), section: sub.title }))
    )
  ) as (AttributeItem & { entityName: string; section: string })[];

  const flaggedItems = allItems.filter(i => i.action !== "none");
  const lowConfItems = allItems.filter(i => i.confidence > 0 && i.confidence < 65);

  const cfg          = FILTER_CONTENT[activeFilter];
  const filterLabel  = FILTERS.find(f => f.id === activeFilter)?.label ?? "All Flagged";

  const [flaggedOpen,  setFlaggedOpen]  = useState(true);
  const [lowConfOpen,  setLowConfOpen]  = useState(true);
  const [actionsOpen,  setActionsOpen]  = useState(true);
  const [recsOpen,     setRecsOpen]     = useState(true);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "var(--color-base-white)" }}>

      {/* Header */}
      <div className="shrink-0 px-5 py-3" style={{ background: "var(--color-neutral-000)", borderBottom: "1px solid var(--color-neutral-200)" }}>
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5">
            <ClipboardCheck size={13} style={{ color: "var(--color-dark-blue-600)" }} aria-hidden />
            <p className="text-[13px] font-bold" style={{ color: "var(--color-neutral-900)" }}>Action &amp; Resolution</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "var(--color-dark-blue-000)", color: "var(--color-dark-blue-600)", border: "1px solid var(--color-dark-blue-100)" }}>
            <Sparkles size={8} aria-hidden />{filterLabel}
          </span>
        </div>
        <p className="text-[10px]" style={{ color: "var(--color-neutral-700)" }}>{flaggedItems.length} items need attention · Select any to resolve</p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-3">

        {/* Section 1 — Flagged Items */}
        <RightPanelSection
          title="Flagged Items"
          count={flaggedItems.length}
          open={flaggedOpen}
          onToggle={() => setFlaggedOpen(v => !v)}
          icon={<AlertTriangle size={11} />}
          countStyle={{ background: "var(--color-red-000)", color: "var(--color-red-700)", border: "1px solid var(--color-red-200)" }}
        >
          {flaggedItems.length === 0 ? (
            <p className="text-[10px] py-1" style={{ color: "var(--color-neutral-700)" }}>No flagged items.</p>
          ) : flaggedItems.map(item => (
            <FlaggedItemRow key={item.id} item={item} onSelect={() => onSelectItem(item.id)} />
          ))}
        </RightPanelSection>

        {/* Section 2 — Low Confidence */}
        <RightPanelSection
          title="Low Confidence"
          count={lowConfItems.length}
          open={lowConfOpen}
          onToggle={() => setLowConfOpen(v => !v)}
          icon={<TrendingDown size={11} />}
          countStyle={{ background: "var(--color-yellow-000)", color: "var(--color-neutral-900)", border: "1px solid var(--color-yellow-300)" }}
        >
          {lowConfItems.length === 0 ? (
            <p className="text-[10px] py-1" style={{ color: "var(--color-neutral-700)" }}>All attributes are above the confidence threshold.</p>
          ) : lowConfItems.map(item => (
            <FlaggedItemRow key={item.id} item={item} onSelect={() => onSelectItem(item.id)} />
          ))}
        </RightPanelSection>

        {/* Section 3 — Required Actions */}
        <RightPanelSection
          title="Required Actions"
          count={cfg.actions.length}
          open={actionsOpen}
          onToggle={() => setActionsOpen(v => !v)}
          icon={<CheckCircle size={11} />}
        >
          {cfg.actions.map((a, i) => (
            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg" style={{ border: "1px solid var(--color-neutral-200)", background: "var(--color-base-white)" }}>
              <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{
                background: a.urgency === "High" ? "var(--color-red-700)" : a.urgency === "Medium" ? "var(--color-yellow-600)" : "var(--color-neutral-600)"
              }} />
              <p className="text-[10px] leading-snug flex-1" style={{ color: "var(--color-neutral-800)" }}>{a.label}</p>
              <span className="text-[9px] font-bold shrink-0" style={{
                color: a.urgency === "High" ? "var(--color-red-700)" : a.urgency === "Medium" ? "var(--color-neutral-700)" : "var(--color-neutral-700)"
              }}>{a.urgency}</span>
            </div>
          ))}
        </RightPanelSection>

        {/* Section 4 — QA Recommendations */}
        <RightPanelSection
          title="QA Recommendations"
          count={cfg.recommendations.length}
          open={recsOpen}
          onToggle={() => setRecsOpen(v => !v)}
          icon={<Bot size={11} />}
          countStyle={{ background: "var(--color-dark-blue-000)", color: "var(--color-dark-blue-600)", border: "1px solid var(--color-dark-blue-100)" }}
        >
          {cfg.recommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg text-[10px] leading-snug"
              style={{ background: "var(--color-dark-blue-000)", border: "1px solid var(--color-dark-blue-100)", color: "var(--color-neutral-700)" }}>
              <span style={{ color: "var(--color-dark-blue-600)" }} className="shrink-0 mt-0.5" aria-hidden>{r.icon}</span>
              {r.text}
            </div>
          ))}
        </RightPanelSection>

      </div>
    </div>
  );
}

/* ================================================================== */
/*  Main page                                                           */
/* ================================================================== */
const DEFAULT_QA_ENTITIES = ["BlackRock Advisors", "BlackRock Institutional", "Entity 13"];

const QA_ENTITY_TO_SECTION_ID: Record<string, string> = {
  "BlackRock Advisors":      "advisors",
  "BlackRock Institutional": "institutional",
  "Entity 13":               "principal-fink",
};

export default function QaDashboard() {
  const [focusedEntity] = useState<string>(DEFAULT_QA_ENTITIES[0]);

  type QaComment = { id: number; author: string; text: string; timestamp: string; sentToAnalyst?: boolean };
  const [comments, setComments] = useState<QaComment[]>([]);
  const [commentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const addComment = () => {
    if (!commentText.trim()) return;
    const ts = new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
    setComments(prev => [...prev, { id: Date.now(), author: "Sarah Chen (QA)", text: commentText.trim(), timestamp: ts }]);
    setCommentText("");
  };

  const [queueIdx] = useState(0);
  const [reviewLens,      setReviewLens]       = useState("areas-of-concern");
  const [activeFilter,    setActiveFilter]     = useState<FilterType>("all");
  const [selectedItemId,  setSelectedItemId]   = useState<string | null>(null);
  const [selectedOwnerId, setSelectedOwnerId]  = useState<string | null>("o3");
  const [expandedSubs,    setExpandedSubs]     = useState<Set<string>>(new Set());

  // Auto-expand subsections that contain items matching the active filter (skip initial mount)
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    const matchingIds = ENTITY_SECTIONS.flatMap(ent =>
      [...ent.cip, ...ent.dueDiligence]
        .filter(sub => applyFilter(sub.items, activeFilter).length > 0)
        .map(sub => sub.id)
    );
    if (matchingIds.length > 0) {
      setExpandedSubs(prev => {
        const next = new Set(prev);
        matchingIds.forEach(id => next.add(id));
        return next;
      });
    }
  }, [activeFilter]);

  const queueEntry = QUEUE[queueIdx];

  const toggleSub = (id: string) => setExpandedSubs(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  });

  const handleSelectOwner = (id: string) => { setSelectedOwnerId(prev => prev === id ? null : id); setSelectedItemId(null); };
  const handleSelectItem  = (id: string) => { setSelectedItemId(prev => prev === id ? null : id); setSelectedOwnerId(null); };

  const activeDecision: ItemDecision | null =
    (selectedOwnerId ? ITEM_DECISIONS[selectedOwnerId] : null) ??
    (selectedItemId  ? ITEM_DECISIONS[selectedItemId]  : null) ?? null;

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-white">
      <div className="flex flex-col flex-1">
        <TopNav />
        <header><QaReviewHeader entry={queueEntry} /></header>

        {/* Comment Panel */}
        <div className="border-b border-ds-neutral-200 bg-white">
          {commentOpen && (
            <div className="px-6 pt-4 pb-4">
              {comments.length > 0 && (
                <div className="flex flex-col gap-2.5 mb-3 max-h-36 overflow-y-auto">
                  {comments.map(c => (
                    <div key={c.id} className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-ds-dark-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <User size={11} className="text-white" />
                      </div>
                      <div className="flex-1 rounded-lg px-3 py-2" style={{ background: "var(--color-neutral-050,#f9f9f9)", border: "1px solid var(--color-neutral-200)" }}>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-semibold text-ds-neutral-900">{c.author}</span>
                          <span className="text-[10px] text-ds-neutral-600">{c.timestamp}</span>
                          <div className="ml-auto flex items-center gap-1">
                            {c.sentToAnalyst
                              ? <span className="text-[10px] font-semibold text-ds-green-700">Sent to Analyst</span>
                              : <button onClick={() => setComments(prev => prev.map(x => x.id === c.id ? { ...x, sentToAnalyst: true } : x))} className="text-[10px] font-semibold text-ds-dark-blue-600 hover:underline">Send to Analyst</button>}
                            <button onClick={() => { setEditingId(c.id); setEditText(c.text); }} className="p-1 text-ds-neutral-500 hover:text-ds-dark-blue-600"><Edit2 size={11} /></button>
                            <button onClick={() => setComments(prev => prev.filter(x => x.id !== c.id))} className="p-1 text-ds-neutral-500 hover:text-ds-red-700"><Trash2 size={11} /></button>
                          </div>
                        </div>
                        {editingId === c.id
                          ? <div className="flex gap-1.5 mt-1"><textarea value={editText} onChange={e => setEditText(e.target.value)} rows={2} autoFocus className="flex-1 text-[11px] px-2 py-1 rounded border border-ds-dark-blue-400 outline-none resize-none" /><button onClick={() => { setComments(prev => prev.map(x => x.id === c.id ? { ...x, text: editText } : x)); setEditingId(null); }} className="px-2 py-1 text-[10px] font-bold text-white rounded" style={{ background: "var(--color-dark-blue-600)" }}>Save</button></div>
                          : <p className="text-[12px] text-ds-neutral-800 leading-snug">{c.text}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-ds-dark-blue-600 flex items-center justify-center shrink-0 mt-1"><User size={11} className="text-white" /></div>
                <div className="flex-1 rounded-lg overflow-hidden" style={{ border: "1px solid var(--color-neutral-200)" }}>
                  <textarea value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addComment(); } }}
                    placeholder="Add a review note..." rows={2} className="w-full px-3 py-2 text-[12px] outline-none resize-none bg-white placeholder:text-ds-neutral-600" />
                  <div className="flex justify-end px-3 py-1.5" style={{ borderTop: "1px solid var(--color-neutral-100)", background: "var(--color-neutral-000)" }}>
                    <button onClick={addComment} disabled={!commentText.trim()} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-white disabled:opacity-40" style={{ background: "var(--color-dark-blue-600)" }}><Plus size={11} />Add</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main 2-column workspace */}
        <main aria-label="QA Review workspace" className="flex-1 flex gap-4 px-6 py-4 overflow-hidden" style={{ minHeight: 0, background: "white" }}>

          {/* Left: Information / Data — entity accordions + filter controls */}
          <div className="flex-1 min-w-0 rounded-xl flex flex-col overflow-hidden" style={{ ...card, boxShadow: "var(--shadow-200)" }}>
            {/* Tab bar + filter strip */}
            <div className="shrink-0" style={{ background: "white", borderBottom: "1px solid var(--color-neutral-200)" }}>
              <div className="flex items-center gap-3 px-4" style={{ minHeight: 40 }}>
                {(() => {
                  const section = ENTITY_SECTIONS.find(s => s.id === QA_ENTITY_TO_SECTION_ID[focusedEntity]);
                  return (
                    <>
                      <span className="text-[13px] font-bold" style={{ color: "var(--color-neutral-900)" }}>
                        {section?.name ?? focusedEntity}
                      </span>
                      {section?.customerType && (
                        <span className="text-[10px]" style={{ color: "var(--color-neutral-700)" }}>
                          {section.customerType}
                        </span>
                      )}
                      {section?.status && <StatusPill status={section.status} size="xs" />}
                    </>
                  );
                })()}
              </div>

              {/* Summary stat tiles */}
              <div className="grid grid-cols-3 gap-2 px-4 pb-3">
                {[
                  { label: "CIP Complete",   value: "92%",  color: "var(--color-green-700)" },
                  { label: "Flagged Items",  value: String(getAllFlaggedItems().length), color: "var(--color-red-700)" },
                  { label: "Low Confidence", value: String(getAllFlaggedItems().filter(i => i.confidence > 0 && i.confidence < 65).length), color: "var(--color-neutral-900)" },
                ].map(s => (
                  <div key={s.label} className="rounded-lg px-3 py-2 text-center" style={{ background: "var(--color-neutral-000)", border: "1px solid var(--color-neutral-200)" }}>
                    <p className="text-[20px] font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[11px] font-semibold mt-1" style={{ color: "var(--color-neutral-700)" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1.5 px-4 pb-2.5 flex-wrap">
                <span className="text-[9px] font-bold uppercase tracking-widest mr-1" style={{ color: "var(--color-neutral-700)" }}>Filter:</span>
                {FILTERS.map(f => {
                  const isActive = activeFilter === f.id;
                  const counts: Record<FilterType, number> = {
                    all:                getAllFlaggedItems().length,
                    "low-confidence":   getAllFlaggedItems().filter(i => i.confidence > 0 && i.confidence < 65).length,
                    "needs-review":     getAllFlaggedItems().filter(i => i.action === "review").length,
                    "missing-evidence": getAllFlaggedItems().filter(i => i.action === "request" || i.confidence === 0).length,
                    exceptions:         getAllFlaggedItems().filter(i => !!i.analystChoice).length,
                  };
                  return (
                    <button
                      key={f.id}
                      onClick={() => setActiveFilter(f.id)}
                      aria-pressed={isActive}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all"
                      style={isActive
                        ? { background: "var(--color-dark-blue-600)", color: "var(--color-base-white)", borderColor: "transparent" }
                        : { background: "var(--color-neutral-100)", color: "var(--color-neutral-900)", borderColor: "var(--color-neutral-400)" }
                      }
                    >
                      {f.label}
                      <span
                        className="text-[9px] font-bold rounded-full px-1"
                        style={isActive
                          ? { background: "var(--color-dark-blue-800)", color: "var(--color-base-white)" }
                          : { background: "var(--color-neutral-300)", color: "var(--color-neutral-800)" }
                        }
                      >{counts[f.id]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Entity accordions — filtered by focused entity pill */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {ENTITY_SECTIONS
                .filter(s => s.id === (QA_ENTITY_TO_SECTION_ID[focusedEntity] ?? s.id))
                .map(entity => (
                  <EntityAccordion
                    key={entity.id}
                    entity={entity}
                    expandedSubs={expandedSubs}
                    selectedItemId={selectedItemId}
                    selectedOwnerId={selectedOwnerId}
                    onToggleSub={toggleSub}
                    onSelectItem={handleSelectItem}
                    onSelectOwner={handleSelectOwner}
                    filter={activeFilter}
                  />
                ))
              }
            </div>
          </div>

          {/* Right: Review Lens + Action / Resolution or Decision detail */}
          <aside aria-label="Action and Resolution panel" className="w-[380px] shrink-0 rounded-xl overflow-hidden flex flex-col" style={{ ...card, boxShadow: "var(--shadow-200)" }}>
            <ReviewLensPanel lens={reviewLens} onChangeLens={setReviewLens} />
            <div className="flex-1 overflow-y-auto min-h-0">
              {activeDecision
                ? <DecisionPanel decision={activeDecision} key={selectedOwnerId ?? selectedItemId ?? "panel"} />
                : <ActionResolutionPanel onSelectItem={handleSelectItem} activeFilter={activeFilter} />
              }
            </div>
          </aside>

        </main>
      </div>
    </div>
  );
}
