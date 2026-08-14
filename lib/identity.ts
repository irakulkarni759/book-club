import { cookies } from "next/headers";

// Which member is looking at the site right now, on this browser.
//
// There is still no login. This is a name picked once from the four real
// members and remembered in a cookie, nothing more. It exists because
// reactions (and later, comments and the shots tally) need to know WHO
// tapped something, not just that someone did.
const COOKIE = "bbc_member";

export async function getViewerId(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE)?.value ?? null;
}

// Only callable from a Server Function: cookies can't be set while a
// Server Component is rendering, only from an action or route handler.
export async function setViewerId(memberId: string) {
  const store = await cookies();
  store.set(COOKIE, memberId, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

export async function clearViewerId() {
  const store = await cookies();
  store.delete(COOKIE);
}
