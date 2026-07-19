export const REGIONS = [
  "All",
  "Greater Accra",
  "Ashanti",
  "Central",
  "Western",
  "Volta",
  "Eastern",
  "Northern",
] as const;

/** Ghana regions for guide onboarding (excludes the "All" filter option). */
export const GUIDE_REGIONS = REGIONS.filter((r) => r !== "All");

export type Region = (typeof REGIONS)[number];
export type GuideRegion = (typeof GUIDE_REGIONS)[number];
