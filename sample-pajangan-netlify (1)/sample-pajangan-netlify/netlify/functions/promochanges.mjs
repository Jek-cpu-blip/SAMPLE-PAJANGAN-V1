import { getStore } from "@netlify/blobs";
import { USERS } from "../lib/users.mjs";

export const config = { path: "/api/promochanges" };

const H = { "content-type": "application/json", "cache-control": "no-store" };
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: H });
const MAX = 5.5 * 1024 * 1024;

export default async (req) => {
  const u = String(req.headers.get("x-cp-user") || "").trim().toLowerCase();
  const e = USERS[u];
  if (!e || e[0] !== (req.headers.get("x-cp-hash") || ""))
    return J({ error: "Login tidak valid. Silakan login ulang." }, 401);

  const store = getStore({ name: "promo-changes", consistency: "strong" });
  const url = new URL(req.url);

  if (req.method === "GET") {
    if (url.searchParams.get("list")) return J({ list: (await store.get("idx", { type: "json" })) || [] });
    const id = url.searchParams.get("id");
    if (!id) return J({ error: "id diperlukan" }, 400);
    const b = await store.get("b/" + id, { type: "json" });
    return b ? J(b) : J({ error: "tidak ditemukan" }, 404);
  }
  if (req.method !== "POST") return J({ error: "method not allowed" }, 405);
  if (e[1] !== "admin") return J({ error: "Khusus admin" }, 403);

  const raw = await req.text();
  if (raw.length > MAX) return J({ error: "Daftar perubahan terlalu besar" }, 413);
  let b;
  try { b = JSON.parse(raw); } catch { return J({ error: "bad json" }, 400); }
  if (!Array.isArray(b.rows) || !b.rows.length) return J({ error: "tidak ada perubahan" }, 400);

  const at = new Date().toISOString();
  const id = at.replace(/[:.]/g, "-");
  const sum = b.sum || {};
  await store.setJSON("b/" + id, { id, at, by: u, sum, rows: b.rows });
  let idx = (await store.get("idx", { type: "json" })) || [];
  idx.unshift({ id, at, by: u, l: +sum.l || 0, c: +sum.c || 0, a: +sum.a || 0, cut: !!sum.cut });
  for (const old of idx.slice(40)) await store.delete("b/" + old.id);
  idx = idx.slice(0, 40);
  await store.setJSON("idx", idx);
  return J({ ok: true, id, at });
};
