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
  const key = process.env.FIREWORKS_API_KEY;
  if (!key) {
    console.warn("[fireworks] no FIREWORKS_API_KEY set, skipping tagging");
    return [];
  }

  const menu = (Object.keys(VOCABULARY) as Dimension[])
    .map(
      (d) =>
        `${d} (choose up to ${PICK_LIMITS[d]}): ${VOCABULARY[d].join(", ")}`
    )
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

  // One attempt against one model. Returns null when the model gave us
  // nothing usable, so the caller can try the next one.
  async function ask(model: string): Promise<string[] | null> {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 600,
        temperature: 0.2,
        response_format: {
          type: "json_schema",
          json_schema: { name: "book_tags", schema },
        },
        messages: [
          {
            role: "system",
            content:
              "You tag books for a book club's taste map. You reply with JSON only, using only the supplied vocabulary.",
          },
          { role: "user", content: prompt },
        ],
      }),
      // Do not let a slow model hold up someone's form forever.
      signal: AbortSignal.timeout(25_000),
    });

    if (!res.ok) {
      console.error("[fireworks]", model, res.status, await res.text());
      return null;
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    // Reasoning models sometimes spend the whole budget thinking and
    // return an empty answer. Treat that as a miss, not as "no tags".
    if (!content) return null;

    let parsed: TagResult;
    try {
      parsed = JSON.parse(content) as TagResult;
    } catch {
      console.error("[fireworks]", model, "returned non-JSON");
      return null;
    }

    // Trust nothing: keep only known terms, respect the per-dimension
    // caps, and drop duplicates.
    const tags: string[] = [];
    for (const d of Object.keys(VOCABULARY) as Dimension[]) {
      const picked = Array.isArray(parsed[d]) ? parsed[d]! : [];
      for (const t of picked.slice(0, PICK_LIMITS[d])) {
        if (ALL_TAGS.includes(t) && !tags.includes(t)) tags.push(t);
      }
    }
    return tags.length ? tags : null;
  }

  try {
    return (await ask(MODEL)) ?? (await ask(FALLBACK_MODEL)) ?? [];
  } catch (err) {
    console.error("[fireworks] tagging failed", err);
    return [];
  }
}
