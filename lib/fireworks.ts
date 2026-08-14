import { VOCABULARY, ALL_TAGS, PICK_LIMITS, type Dimension } from "./vocabulary";

const ENDPOINT = "https://api.fireworks.ai/inference/v1/chat/completions";

// Fireworks rotates its serverless lineup, so these are pinned after
// testing them on real books, and overridable without touching code.
//
// gpt-oss-120b: ~3s, correct, cheap.
// deepseek-v4-flash: ~7s, agrees with it exactly. Used only when the
// primary returns nothing, which reasoning models occasionally do when
// they spend their whole token budget thinking instead of answering.
const MODEL = process.env.FIREWORKS_MODEL ?? "accounts/fireworks/models/gpt-oss-120b";
const FALLBACK_MODEL =
  process.env.FIREWORKS_FALLBACK_MODEL ?? "accounts/fireworks/models/deepseek-v4-flash";

/**
 * One call to one model, constrained to a JSON schema. Returns null (never
 * throws) when the key is missing, the request fails, or the model returns
 * nothing usable — reasoning models occasionally spend their whole token
 * budget thinking and answer with nothing at all.
 */
async function askJSON<T>(input: {
  model: string;
  system: string;
  prompt: string;
  schemaName: string;
  schema: object;
  maxTokens?: number;
}): Promise<T | null> {
  const key = process.env.FIREWORKS_API_KEY;
  if (!key) {
    console.warn("[fireworks] no FIREWORKS_API_KEY set");
    return null;
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: input.model,
        max_tokens: input.maxTokens ?? 700,
        temperature: 0.4,
        response_format: {
          type: "json_schema",
          json_schema: { name: input.schemaName, schema: input.schema },
        },
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: input.prompt },
        ],
      }),
      // Do not let a slow model hold up a page load forever.
      signal: AbortSignal.timeout(25_000),
    });

    if (!res.ok) {
      console.error("[fireworks]", input.model, res.status, await res.text());
      return null;
    }

    const json = await res.json();
    const choice = json?.choices?.[0];
    const content = choice?.message?.content;
    if (!content) return null;

    try {
      return JSON.parse(content) as T;
    } catch {
      // A model that spends its budget "thinking" in plain text before the
      // JSON gets cut off mid-answer here (finish_reason "length"). Not a
      // network failure, just this model needing more room or a stronger
      // instruction not to narrate. Logged so it is diagnosable, not silent.
      console.error(
        "[fireworks]",
        input.model,
        "returned unparseable content, finish_reason:",
        choice?.finish_reason
      );
      return null;
    }
  } catch (err) {
    console.error("[fireworks]", input.model, "failed", err);
    return null;
  }
}

/** Tries the primary model, then the fallback, returning the first hit. */
async function askWithFallback<T>(
  args: Omit<Parameters<typeof askJSON<T>>[0], "model">
): Promise<T | null> {
  return (await askJSON<T>({ ...args, model: MODEL })) ?? askJSON<T>({ ...args, model: FALLBACK_MODEL });
}

type TagResult = { [D in Dimension]?: string[] };

/**
 * Describes a book using the shared vocabulary.
 *
 * Returns a flat list of tags. Never throws: if Fireworks is down, slow, or
 * the key is missing, it returns an empty list so a member's book still
 * saves. Losing tags is recoverable, losing what someone typed is not.
 */
export async function tagBook(input: {
  title: string;
  author?: string | null;
  facts?: string[];
}): Promise<string[]> {
  const menu = (Object.keys(VOCABULARY) as Dimension[])
    .map((d) => `${d} (choose up to ${PICK_LIMITS[d]}): ${VOCABULARY[d].join(", ")}`)
    .join("\n");

  const facts = (input.facts ?? []).filter(Boolean);

  const prompt = [
    `Book: ${input.title}`,
    input.author ? `Author: ${input.author}` : null,
    facts.length
      ? `A reader said this about it:\n${facts.map((f) => `- ${f}`).join("\n")}`
      : null,
    "",
    "Describe this book using ONLY the terms below. Pick the terms that",
    "genuinely fit; do not fill every slot. Reply with JSON only.",
    "",
    menu,
  ]
    .filter(Boolean)
    .join("\n");

  const schema = {
    type: "object",
    properties: Object.fromEntries(
      (Object.keys(VOCABULARY) as Dimension[]).map((d) => [
        d,
        {
          type: "array",
          items: { type: "string", enum: [...VOCABULARY[d]] },
          maxItems: PICK_LIMITS[d],
        },
      ])
    ),
    required: Object.keys(VOCABULARY),
    additionalProperties: false,
  };

  const parsed = await askWithFallback<TagResult>({
    system:
      "You tag books for a book club's taste map. You reply with JSON only, using only the supplied vocabulary.",
    prompt,
    schemaName: "book_tags",
    schema,
  });
  if (!parsed) return [];

  // Trust nothing: keep only known terms, respect the per-dimension caps,
  // and drop duplicates, regardless of what the schema was supposed to
  // enforce. Models drift.
  const tags: string[] = [];
  for (const d of Object.keys(VOCABULARY) as Dimension[]) {
    const picked = Array.isArray(parsed[d]) ? parsed[d]! : [];
    for (const t of picked.slice(0, PICK_LIMITS[d])) {
      if (ALL_TAGS.includes(t) && !tags.includes(t)) tags.push(t);
    }
  }
  return tags;
}

export type Candidate = { title: string; author: string; reason: string };

/**
 * Proposes three books for the group to vote on, given everyone's shelves.
 * Never suggests a title already sitting on any shelf. Returns [] (never
 * throws) if Fireworks is unavailable — the caller decides what "no
 * candidates yet" looks like.
 */
export async function proposeCandidates(
  members: { name: string; books: { title: string; author: string | null; tags: string[] }[] }[]
): Promise<Candidate[]> {
  const shelves = members
    .map((m) => {
      const lines = m.books.map(
        (b) => `  - ${b.title}${b.author ? ` by ${b.author}` : ""} [${b.tags.join(", ")}]`
      );
      return `${m.name}:\n${lines.join("\n")}`;
    })
    .join("\n\n");

  const alreadyShelved = new Set(
    members.flatMap((m) => m.books.map((b) => b.title.trim().toLowerCase()))
  );

  const prompt = [
    "This is a book club's shelves. Each line is a book, followed by the",
    "vocabulary tags describing it in brackets.",
    "",
    shelves,
    "",
    "Propose exactly three books for the group to read next, none of which",
    "appear on any shelf above. For each, give a short reason that names",
    "specific members and explains what in THEIR shelf makes this a fit.",
    "The three should differ from each other, not all satisfy the same",
    "person. Reply with JSON only.",
  ].join("\n");

  const schema = {
    type: "object",
    properties: {
      candidates: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            author: { type: "string" },
            reason: { type: "string" },
          },
          required: ["title", "author", "reason"],
          additionalProperties: false,
        },
      },
    },
    required: ["candidates"],
    additionalProperties: false,
  };

  const parsed = await askWithFallback<{ candidates: Candidate[] }>({
    system:
      "You recommend books for a book club by reasoning about what its members already love. Reply with the JSON object directly — no reasoning, commentary, or narration before it.",
    prompt,
    schemaName: "candidates",
    schema,
    // Measured against the real prompt: three reasons that each name
    // specific members runs 900-1050 completion tokens even on a model
    // that answers cleanly. Reasoning models spend extra tokens thinking
    // first, so this leaves real headroom rather than clipping mid-answer.
    maxTokens: 3000,
  });
  if (!parsed?.candidates) return [];

  // A model can still recommend something already shelved despite the
  // instruction. Drop those rather than trust the prompt alone.
  return parsed.candidates.filter(
    (c) => c.title && c.author && !alreadyShelved.has(c.title.trim().toLowerCase())
  );
}
