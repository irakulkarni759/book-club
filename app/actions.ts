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

  if (id) {
    await supabase.from("books").update({ title, author, why }).eq("id", id);
  } else {
    const { data } = await supabase
      .from("books")
      .insert({ member_id: memberId, title, author, why })
      .select("id")
      .single();
    id = data?.id ?? null;
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
  revalidatePath("/shelf/[name]", "page");
}
