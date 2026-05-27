/**
 * Work Queue page seed copy.
 *
 * Header titles + state-view (loading / error / empty) display strings,
 * extracted so API/i18n can replace them without touching the components.
 */

export interface WorkQueueHeaderCopy {
  title: string;
  subtitle: string;
}

export interface WorkQueueStateCopy {
  loading: string;
  error: string;
}

export interface WorkQueueSeed {
  header: WorkQueueHeaderCopy;
  states: WorkQueueStateCopy;
}

export const WORK_QUEUE_SEED: WorkQueueSeed = {
  header: {
    title: "Work Queue",
    subtitle: "DRG entities awaiting KYC review — sorted by risk and due date",
  },
  states: {
    loading: "Loading queue…",
    error: "Failed to load work queue. Please try again.",
  },
};

export function getWorkQueueData(): WorkQueueSeed {
  return WORK_QUEUE_SEED;
}
