import { getStore } from "@netlify/blobs";

export const config = { path: "/api/stock" };

const KEY = "stock";
const H = { "content-type": "application/json", "cache-control": "no-store" };
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: H });

export default async (req) => {
  const store = getStore({ name: "sample-pajangan", consistency: "strong" });

  if (req.method === "GET") {
    return J((await store.get(KEY, { type: "json" })) || {});
  }
  if (req.method !== "POST") return J({ error: "method not allowed" }, 405);

  const pin = Netlify.env.get("EDIT_PIN");
  if (pin && req.headers.get("x-pin") !== pin) return J({ error: "unauthorized" }, 401);

  let o;
  try { o = await req.json(); } catch { return J({ error: "bad json" }, 400); }

  if (o.reset) {
    await store.delete(KEY);
    return J({ ok: true });
  }
  if (!Array.isArray(o.items)) return J({ error: "invalid data" }, 400);
  await store.setJSON(KEY, o);
  return J({ ok: true, count: o.items.length });
};
