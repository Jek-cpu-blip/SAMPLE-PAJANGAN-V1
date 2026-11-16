import { getStore } from "@netlify/blobs";
import { USERS } from "../lib/users.mjs";

export const config = { path: "/api/promodata" };

const H = { "content-type": "application/json", "cache-control": "no-store" };
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: H });
const MAX = 5.5 * 1024 * 1024; // batas payload fungsi Netlify ~6 MB

export default async (req) => {
  const u = String(req.headers.get("x-cp-user") || "").trim().toLowerCase();
  const e = USERS[u];
  if (!e || e[0] !== (req.headers.get("x-cp-hash") || ""))
    return J({ error: "Login tidak valid. Silakan login ulang." }, 401);

  const store = getStore({ name: "promo-data", consistency: "strong" });

  if (req.method === "GET") {
    const d = await store.get("current", { type: "text" });
    if (!d) return J({ error: "belum ada data di server" }, 404);
    return new Response(d, { status: 200, headers: H });
  }
  if (req.method !== "POST") return J({ error: "method not allowed" }, 405);
  if (e[1] !== "admin") return J({ error: "Khusus admin" }, 403);

  const raw = await req.text();
  if (raw.length > MAX)
    return J({ error: "Data terlalu besar untuk disimpan lewat server (maks ~5 MB). Gunakan Export data.json." }, 413);
  let b;
  try { b = JSON.parse(raw); } catch { return J({ error: "bad json" }, 400); }
  if (typeof b.gz !== "string" || b.gz.length < 1000) return J({ error: "data tidak valid" }, 400);

  await store.set("current", JSON.stringify({ at: new Date().toISOString(), by: u, gz: b.gz }));
  return J({ ok: true, size: b.gz.length });
};
