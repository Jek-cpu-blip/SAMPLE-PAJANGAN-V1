import { getStore } from "@netlify/blobs";

export const config = { path: "/api/samples" };

const KEY = "samples";
const H = { "content-type": "application/json", "cache-control": "no-store" };
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: H });
const clean = (a) => [...new Set((a || []).map((x) => String(x).trim()).filter(Boolean))];

function add(list, c, locs, at) {
  c = String(c || "").trim();
  locs = clean(locs);
  if (!c || !locs.length) return;
  let s = list.find((x) => x.c === c);
  if (!s) { s = { c, locs: [], at }; list.push(s); }
  for (const l of locs) {
    if (!s.locs.some((x) => x.toLowerCase() === l.toLowerCase())) s.locs.push(l);
  }
  s.at = at || s.at;
}

export default async (req) => {
  const store = getStore({ name: "sample-pajangan", consistency: "strong" });
  let list = (await store.get(KEY, { type: "json" })) || [];

  if (req.method === "GET") return J({ samples: list });
  if (req.method !== "POST") return J({ error: "method not allowed" }, 405);

  const pin = Netlify.env.get("EDIT_PIN");
  if (pin && req.headers.get("x-pin") !== pin) return J({ error: "unauthorized" }, 401);

  let o;
  try { o = await req.json(); } catch { return J({ error: "bad json" }, 400); }

  if (o.op === "add") add(list, o.c, o.locs, o.at);
  else if (o.op === "bulk") (o.items || []).forEach((i) => add(list, i.c, i.locs, i.at));
  else if (o.op === "del") list = list.filter((s) => s.c !== o.c);
  else if (o.op === "delLoc") {
    const s = list.find((x) => x.c === o.c);
    if (s) {
      s.locs = s.locs.filter((l) => l !== o.loc);
      if (!s.locs.length) list = list.filter((x) => x !== s);
    }
  } else return J({ error: "unknown op" }, 400);

  await store.setJSON(KEY, list);
  return J({ samples: list });
};
