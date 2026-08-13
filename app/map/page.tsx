import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { TasteMap } from "@/components/TasteMap";
import { allPairs, commonGround, signatures, tasteOf } from "@/lib/taste";

export const metadata = { title: "taste map" };

export default async function MapPage() {
  const { data: rows } = await supabase
    .from("members")
    .select("id, name, books(tags)")
    .order("name");

  const members = (rows ?? []).map(tasteOf);
  const tagged = members.filter((m) => m.tags.size > 0);
  const pairs = allPairs(tagged);
  // Require most of the group, not half of it. At half, nearly every tag
  // qualifies and the list stops meaning anything.
  const common = commonGround(tagged, Math.max(2, Math.ceil(tagged.length * 0.75)));
  const odd = signatures(tagged);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-10 pb-24">
      <Link
        href="/"
        className="font-display text-sm text-chalk-dim hover:text-chalk"
      >
        &larr; all shelves
      </Link>

      <h1 className="chalk mt-6 font-display text-5xl">taste map</h1>
      <p className="mt-2 max-w-lg text-sm text-chalk-dim">
        Nobody picked the same books, so this compares what the books are
        <em> like</em> instead: genre, mood, pacing, themes. A heavier line
        means more of that vocabulary in common.
      </p>

      {tagged.length < 2 ? (
        <p className="chalk mt-16 font-display text-xl">
          {tagged.length === 0
            ? "no shelves filled yet"
            : "one shelf down, at least one more to go before there is anything to compare"}
        </p>
      ) : (
        <>
          <div className="mt-12">
            <TasteMap members={tagged} pairs={pairs} />
          </div>

          <section className="mt-16">
            <h2 className="chalk font-display text-2xl">who reads alike</h2>
            <ul className="mt-5 space-y-5">
              {pairs.map((p) => (
                <li key={`${p.a.id}-${p.b.id}`}>
                  <div className="flex items-baseline gap-3">
                    <span className="chalk font-display text-lg">
                      {p.a.name.toLowerCase()} &amp; {p.b.name.toLowerCase()}
                    </span>
                    <span className="font-display text-sm text-chalk-dim">
                      {Math.round(p.score * 100)}% overlap
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-chalk-dim">
                    {p.shared.length
                      ? [...p.shared].sort().slice(0, 10).join(" · ") +
                        (p.shared.length > 10
                          ? ` +${p.shared.length - 10} more`
                          : "")
                      : "nothing in common at all"}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {common.length > 0 && (
            <section className="mt-14">
              <h2 className="chalk font-display text-2xl">common ground</h2>
              <p className="mt-1 text-sm text-chalk-dim">
                What most of the group reaches for. This is what the monthly
                pick should be built from.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                {common.map(({ tag, count }) => (
                  <span
                    key={tag}
                    title={`${count} of ${tagged.length} shelves`}
                    className="chalk font-display"
                    style={{ fontSize: `${0.95 + (count / tagged.length) * 0.8}rem` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="mt-14">
            <h2 className="chalk font-display text-2xl">only you</h2>
            <p className="mt-1 text-sm text-chalk-dim">
              Tags nobody else on the wall has.
            </p>
            <ul className="mt-4 space-y-3">
              {tagged.map((m) => (
                <li key={m.id} className="flex gap-4">
                  <span className="w-20 shrink-0 font-display text-sm text-chalk-dim">
                    {m.name.toLowerCase()}
                  </span>
                  <span className="chalk font-display text-sm">
                    {odd.get(m.id)?.length
                      ? odd.get(m.id)!.join(" · ")
                      : "nothing unique"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
