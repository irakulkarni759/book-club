"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { tagBook } from "@/lib/fireworks";

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
