import { getStore } from "@netlify/blobs";
import { USERS } from "../lib/users.mjs";

export const config = { path: "/api/promoprogress" };

const H = { "content-type": "application/json", "cache-control": "no-store" };
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: H });
const DRE = /^\d{4}-\d{2}-\d{2}$/;

export default async (req) => {
  const u = String(req.headers.get("x-cp-user") || "").trim().toLowerCase();
  const e = USERS[u];
  if (!e || e[0] !== (req.headers.get("x-cp-hash") || ""))
    return J({ error: "Login tidak valid. Silakan login ulang." }, 401);

  const store = getStore({ name: "promo-progress", consistency: "strong" });
  const url = new URL(req.url);

  if (req.method === "GET") {
    const date = url.searchParams.get("date");
    if (!DRE.test(date || "")) return J({ error: "Tanggal tidak valid" }, 400);
    return J({ p: (await store.get("prog/" + date, { type: "json" })) || {} });
  }
  if (req.method !== "POST") return J({ error: "method not allowed" }, 405);

  let b;
  try { b = await req.json(); } catch { return J({ error: "bad json" }, 400); }
  if (!DRE.test(b.date || "")) return J({ error: "Tanggal tidak valid" }, 400);
  if (!["B", "P", "S", "K"].includes(b.status)) return J({ error: "Status tidak valid" }, 400);
  const keys = (Array.isArray(b.keys) ? b.keys : []).slice(0, 6000).map((k) => String(k).slice(0, 60));
  if (!keys.length) return J({ error: "Tidak ada barang dipilih" }, 400);

  const map = (await store.get("prog/" + b.date, { type: "json" })) || {};
  const now = new Date().toISOString();
  for (const k of keys) {
    if (b.status === "B") delete map[k];
    else map[k] = [b.status, u, now];
  }
  await store.setJSON("prog/" + b.date, map);
  return J({ ok: true, at: now, n: keys.length });
};
