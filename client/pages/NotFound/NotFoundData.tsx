/**
 * NotFound page seed copy.
 */

export interface NotFoundSeed {
  code: string;
  message: string;
  linkLabel: string;
  homePath: string;
}

export const NOT_FOUND_SEED: NotFoundSeed = {
  code: "404",
  message: "Oops! Page not found",
  linkLabel: "Return to Home",
  homePath: "/",
};

export function getNotFoundData(): NotFoundSeed {
  return NOT_FOUND_SEED;
}
