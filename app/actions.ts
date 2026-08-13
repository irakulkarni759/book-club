"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

// "use server" at the top of a file marks every export as a Server Action:
// a function the browser can call, but whose body only ever runs on the
// server. The form calls this; the database is never touched by the browser.
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

  if (bookId) {
    await supabase
      .from("books")
      .update({ title, author, why: facts.join("\n") })
      .eq("id", String(bookId));
  } else {
    await supabase.from("books").insert({
      member_id: memberId,
      title,
      author,
      why: facts.join("\n"),
    });
  }

  // Tell Next.js the cached pages are stale so the new spine shows up.
  revalidatePath("/");
  revalidatePath("/shelf/[name]", "page");
}
