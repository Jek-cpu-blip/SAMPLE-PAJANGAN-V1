import { getStore } from "@netlify/blobs";

export const config = { path: "/api/takeouts" };

const KEY = "list";
const H = { "content-type": "application/json", "cache-control": "no-store" };
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: H });
const cl = (s, n) => String(s ?? "").trim().slice(0, n);

export default async (req) => {
  const store = getStore({ name: "take-out", consistency: "strong" });
  let list = (await store.get(KEY, { type: "json" })) || [];

  if (req.method === "GET") return J({ items: list });
  if (req.method !== "POST") return J({ error: "method not allowed" }, 405);

  const pin = Netlify.env.get("EDIT_PIN");
  if (pin && req.headers.get("x-pin") !== pin) return J({ error: "unauthorized" }, 401);

  let b;
  try { b = await req.json(); } catch { return J({ error: "bad json" }, 400); }
  const now = new Date().toISOString();
  const cs = Array.isArray(b.cs) ? b.cs.map((c) => String(c)) : [];

  if (b.op === "add") {
    let added = 0, skipped = 0;
    for (const it of (b.items || []).slice(0, 500)) {
      const c = cl(it.c, 40);
      if (!c) continue;
      if (list.some((x) => x.c === c && x.st !== "S")) { skipped++; continue; }
      list.push({
        c, n: cl(it.n, 200), b: cl(it.b, 80), s: cl(it.s, 60), m: cl(it.m, 80),
        locs: (Array.isArray(it.locs) ? it.locs : []).map((l) => cl(l, 80)).filter(Boolean).slice(0, 10),
        t: +it.t || 0, d: +it.d || 0, why: cl(it.why, 80),
        pic: cl(it.pic, 60), st: "B", note: "", at: now, doneAt: "",
      });
      added++;
    }
    await store.setJSON(KEY, list);
    return J({ items: list, added, skipped });
  }
  if (b.op === "update") {
    const x = list.find((y) => y.c === String(b.c));
    if (!x) return J({ error: "item tidak ditemukan" }, 404);
    if (b.pic !== undefined) x.pic = cl(b.pic, 60);
    if (b.note !== undefined) x.note = cl(b.note, 300);
    if (b.st !== undefined) {
      if (!["B", "P", "S"].includes(b.st)) return J({ error: "status tidak valid" }, 400);
      x.st = b.st;
      x.doneAt = b.st === "S" ? now : "";
    }
  } else if (b.op === "assign") {
    const pic = cl(b.pic, 60);
    list.forEach((x) => { if (cs.includes(x.c)) x.pic = pic; });
  } else if (b.op === "del") {
    list = list.filter((x) => !cs.includes(x.c));
  } else if (b.op === "clearDone") {
    list = list.filter((x) => x.st !== "S");
  } else return J({ error: "unknown op" }, 400);

  await store.setJSON(KEY, list);
  return J({ items: list });
};
