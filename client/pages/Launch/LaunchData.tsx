/**
 * Launch page seed data + types.
 *
 * Persona card definitions and hero copy extracted so an API-backed
 * provider can replace them later without touching the components.
 */

export type PersonaKey = "analyst" | "qa";
export type PersonaIconKey = "shield" | "clipboard-check";

export interface PersonaSeed {
  persona: PersonaKey;
  initials: string;
  name: string;
  role: string;
  description: string;
  tasks: readonly string[];
  iconKey: PersonaIconKey;
  route: string;
  accent: string;
}

export const PERSONAS: readonly PersonaSeed[] = [
  {
    persona: "analyst",
    initials: "AK",
    name: "Alex Kim",
    role: "KYC Analyst",
    description:
      "Review and resolve KYC exceptions, manage entity processing, and submit cases for approval.",
    tasks: [
      "Process DRG entity selections",
      "Review and resolve exceptions",
      "Submit cases for QA approval",
    ],
    iconKey: "shield",
    route: "/analyst-dashboard",
    accent: "bg-[#00338D]",
  },
  {
    persona: "qa",
    initials: "QN",
    name: "Quinn",
    role: "QA Reviewer",
    description:
      "Perform quality assurance review of analyst decisions, validate attributes, and sign off on completed cases.",
    tasks: [
      "Review analyst attribute decisions",
      "Validate beneficial owner data",
      "Accept or escalate QA findings",
    ],
    iconKey: "clipboard-check",
    route: "/qa-work-hub",
    accent: "bg-[#004C97]",
  },
] as const;

export interface LaunchHero {
  title: string;
  subtitle: string;
  demoNoteLead: string;
  demoNote: string;
}

export const LAUNCH_HERO: LaunchHero = {
  title: "KYC Platform",
  subtitle: "Select your role to continue",
  demoNoteLead: "Demo only.",
  demoNote:
    " This launch screen is a placeholder. The production entry point for each persona will be determined based on authentication, role assignment, and session context.",
};

export interface LaunchPreviewLink {
  href: string;
  label: string;
}

export const LAUNCH_PREVIEW_LINKS: readonly LaunchPreviewLink[] = [
  { href: "/analyst-dashboard", label: "Analyst Dashboard" },
  { href: "/qa-work-hub", label: "QA Work Hub" },
];

export const LAUNCH_FOOTER = "KPMG KYC Platform · Confidential";

export interface LaunchSeed {
  hero: LaunchHero;
  personas: readonly PersonaSeed[];
  previewLinks: readonly LaunchPreviewLink[];
  footer: string;
}

export const LAUNCH_SEED: LaunchSeed = {
  hero: LAUNCH_HERO,
  personas: PERSONAS,
  previewLinks: LAUNCH_PREVIEW_LINKS,
  footer: LAUNCH_FOOTER,
};

export function getLaunchData(): LaunchSeed {
  return LAUNCH_SEED;
}
