// The controlled vocabulary every book is described with.
//
// This is the single most important file for the taste map. If the model
// were free to invent tags, one book would come back "melancholy" and
// another "melancholic" and they would look unrelated. Forcing every book
// through the same words is what makes similarity measurable.
//
// Adding a term is fine. Renaming one orphans every book already tagged
// with the old name, so re-tag if you do.

export const VOCABULARY = {
  genre: [
    "literary-fiction",
    "speculative",
    "sci-fi",
    "fantasy",
    "horror",
    "thriller",
    "mystery",
    "romance",
    "historical",
    "memoir",
    "essays",
    "poetry",
    "nonfiction",
    "graphic-novel",
    "short-stories",
  ],
  mood: [
    "melancholic",
    "bleak",
    "tender",
    "funny",
    "unsettling",
    "hopeful",
    "angry",
    "dreamy",
    "cozy",
    "sensual",
    "cerebral",
  ],
  pacing: ["slow-burn", "propulsive", "meandering", "tight"],
  form: [
    "experimental",
    "plot-driven",
    "character-driven",
    "vignettes",
    "epistolary",
    "nonlinear",
  ],
  themes: [
    "family",
    "grief",
    "class",
    "colonialism",
    "identity",
    "desire",
    "violence",
    "coming-of-age",
    "alienation",
    "motherhood",
    "friendship",
    "obsession",
    "faith",
    "war",
    "migration",
    "work",
    "gender",
    "mental-health",
    "body",
    "power",
  ],
  era: ["contemporary", "late-20th-century", "classic", "ancient"],
  voice: ["sparse-prose", "lush-prose", "ironic", "earnest", "unreliable"],
} as const;

export type Dimension = keyof typeof VOCABULARY;

export const ALL_TAGS: string[] = Object.values(VOCABULARY).flat();

// How many tags the model may pick per dimension.
export const PICK_LIMITS: Record<Dimension, number> = {
  genre: 2,
  mood: 3,
  pacing: 1,
  form: 2,
  themes: 4,
  era: 1,
  voice: 2,
};
