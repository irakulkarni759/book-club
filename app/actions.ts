"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { tagBook } from "@/lib/fireworks";
import { clearViewerId, getViewerId, setViewerId } from "@/lib/identity";
import { REACTION_SET } from "@/lib/reactions";

// "use server" at the top of a file marks every export as a Server Action:
// a function the browser can call, but whose body only ever runs on the
// server. That is also why the Fireworks key can live here safely.
export async function saveBook(formData: FormData) {
  const memberId = String(formData.get("memberId"));
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();

  // Five separate inputs come back as five entries under the same name.
  const facts = formData
    .getAll("fact")
    .map((f) => String(f).trim())
    .filter(Boolean);

  if (!title) return;

  const bookId = formData.get("bookId");
  const why = facts.join("\n");

  // Save what the member typed FIRST, before involving the model. If
  // Fireworks is slow or down, their book is already safe.
  let id: string | null = bookId ? String(bookId) : null;

  // A save with no bookId used to always INSERT, so submitting twice while
  // the first save was still tagging created a second copy. Look for the
  // same title on this shelf first and update that instead, which makes
  // saving the same book twice a no-op rather than a duplicate.
  if (!id) {
    const { data: existing } = await supabase
      .from("books")
      .select("id")
      .eq("member_id", memberId)
      .ilike("title", title)
      .maybeSingle();
    id = existing?.id ?? null;
  }

  if (id) {
    await supabase.from("books").update({ title, author, why }).eq("id", id);
  } else {
    const { data, error } = await supabase
      .from("books")
      .insert({ member_id: memberId, title, author, why })
      .select("id")
      .single();
    id = data?.id ?? null;

    // If two saves raced past the check above, the unique index rejects
    // the second one. That is the correct outcome, but we still want the
    // id so the book gets tagged rather than silently skipped.
    if (!id && error) {
      const { data: raced } = await supabase
        .from("books")
        .select("id")
        .eq("member_id", memberId)
        .ilike("title", title)
        .maybeSingle();
      id = raced?.id ?? null;
    }
  }

  // Then describe it in the shared vocabulary. tagBook never throws; an
  // empty result just means this book stays untagged until it is edited.
  if (id) {
    const tags = await tagBook({ title, author, facts });
    if (tags.length) {
      await supabase.from("books").update({ tags }).eq("id", id);
    }
  }

  revalidatePath("/");
  revalidatePath("/map");
  revalidatePath("/shelf/[name]", "page");
}

// Sets the "who are you" cookie. Called once, from the name picker.
// Cookies can only be written from a Server Function, never while a
// Server Component is rendering, which is why this exists separately
// from the pages that read the identity back out.
export async function chooseIdentity(formData: FormData) {
  const memberId = String(formData.get("memberId") ?? "");
  if (!memberId) return;
  await setViewerId(memberId);
  // "layout" revalidates every page, since the name picker can appear
  // above any of them.
  revalidatePath("/", "layout");
}

// Forgets who you are, so the picker reappears. Used by the "not you?"
// link, and by anyone testing on a shared laptop.
export async function switchIdentity() {
  await clearViewerId();
  revalidatePath("/", "layout");
}

// Adding a reaction you already left removes it. That is the whole
// interaction: tap to react, tap again to take it back.
export async function toggleReaction(bookId: string, emoji: string) {
  if (!REACTION_SET.includes(emoji as (typeof REACTION_SET)[number])) return;

  const memberId = await getViewerId();
  if (!memberId) return; // no identity picked yet, nothing to attribute this to

  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("book_id", bookId)
    .eq("member_id", memberId)
    .eq("emoji", emoji)
    .maybeSingle();

  if (existing) {
    await supabase.from("reactions").delete().eq("id", existing.id);
  } else {
    await supabase.from("reactions").insert({ book_id: bookId, member_id: memberId, emoji });
  }

  revalidatePath("/");
  revalidatePath("/shelf/[name]", "page");
}
