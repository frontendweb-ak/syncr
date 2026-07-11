export const COMPONENT_FRAMEWORK = [
  "REACT",
  "VUE",
  "SVELTE",
  "ANGULAR",
  "SOLID",
  "UNIVERSAL",
] as const;
export type ComponentFramework = (typeof COMPONENT_FRAMEWORK)[number];
