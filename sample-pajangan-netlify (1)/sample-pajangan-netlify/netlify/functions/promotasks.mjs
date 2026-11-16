import { getStore } from "@netlify/blobs";
import { USERS } from "../lib/users.mjs";

export const config = { path: "/api/promotasks" };

const H = { "content-type": "application/json", "cache-control": "no-store" };
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: H });
const DRE = /^\d{4}-\d{2}-\d{2}$/;
const STS = ["Belum", "Proses", "Selesai", "Kendala"];
const STAFF = Object.keys(USERS).filter((u) => USERS[u][1] === "staff");
const cl = (s, n) => String(s ?? "").trim().slice(0, n);
const nid = () => crypto.randomUUID().slice(0, 8);

export default async (req) => {
  const u = cl(req.headers.get("x-cp-user"), 60).toLowerCase();
  const h = req.headers.get("x-cp-hash") || "";
  const e = USERS[u];
  if (!e || e[0] !== h) return J({ error: "Login tidak valid. Silakan login ulang." }, 401);
  const A = e[1] === "admin";

  const store = getStore({ name: "promo-tasks", consistency: "strong" });
  const load = async (d) => (await store.get("tasks/" + d, { type: "json" })) || [];
  const view = (l) => (A ? l : l.filter((t) => t.to === u));
  const url = new URL(req.url);

  if (req.method === "GET") {
    const sm = url.searchParams.get("summary");
    if (sm) {
      if (!A) return J({ error: "Khusus admin" }, 403);
      const to = url.searchParams.get("to");
      if (!DRE.test(to || "")) return J({ error: "Tanggal tidak valid" }, 400);
      const days = [];
      for (let i = 0; i < Math.min(31, +sm || 7); i++) {
        const d = new Date(to + "T00:00:00Z");
        d.setUTCDate(d.getUTCDate() - i);
        const iso = d.toISOString().slice(0, 10);
        const l = await load(iso);
        const c = { date: iso, total: l.length, Belum: 0, Proses: 0, Selesai: 0, Kendala: 0, tb: 0, bs: 0 };
        l.forEach((t) => { c[t.status] = (c[t.status] || 0) + 1; c.tb += t.n || 0; if (t.status === "Selesai") c.bs += t.n || 0; });
        days.push(c);
      }
      return J({ days });
    }
    const date = url.searchParams.get("date");
    if (!DRE.test(date || "")) return J({ error: "Tanggal tidak valid" }, 400);
    return J({ tasks: view(await load(date)) });
  }
  if (req.method !== "POST") return J({ error: "method not allowed" }, 405);

  let b;
  try { b = await req.json(); } catch { return J({ error: "bad json" }, 400); }
  const date = b.date;
  if (!DRE.test(date || "")) return J({ error: "Tanggal tidak valid" }, 400);
  let l = await load(date);
  const now = new Date().toISOString();
  const adminOnly = () => J({ error: "Khusus admin" }, 403);

  if (b.op === "add") {
    if (!A) return adminOnly();
    const items = (b.items || []).slice(0, 1000);
    const pool = b.to === "rr" ? STAFF : STAFF.includes(b.to) ? [b.to] : [];
    let k = 0, added = 0, skipped = 0;
    for (const it of items) {
      const no = cl(it.no, 60);
      if (!no) continue;
      const cat = cl(it.cat, 80);
      if (l.some((t) => t.no.toLowerCase() === no.toLowerCase() && (t.cat || "") === cat)) { skipped++; continue; }
      const to = STAFF.includes(it.to) ? it.to : pool.length ? pool[k++ % pool.length] : "";
      l.push({
        id: nid(), date, no, name: cl(it.name, 200), ins: cl(it.ins, 300),
        cat, n: Math.max(0, Math.min(1e6, Math.floor(+it.n || 0))),
        to, toAt: to ? now : "", status: "Belum", note: "", by: "", at: "",
        doneAt: "", created: now, createdBy: u,
      });
      added++;
    }
    await store.setJSON("tasks/" + date, l);
    return J({ tasks: view(l), added, skipped });
  }

  if (b.op === "update") {
    const t = l.find((x) => x.id === b.id);
    if (!t) return J({ error: "Tugas tidak ditemukan" }, 404);
    if (!A && t.to !== u) return J({ error: "Bukan tugas Anda" }, 403);
    if (b.status !== undefined) {
      if (!STS.includes(b.status)) return J({ error: "Status tidak valid" }, 400);
      t.status = b.status;
      t.doneAt = b.status === "Selesai" ? now : "";
    }
    if (b.note !== undefined) t.note = cl(b.note, 300);
    t.by = u; t.at = now;
  } else if (b.op === "assign") {
    if (!A) return adminOnly();
    const to = STAFF.includes(b.to) ? b.to : "";
    l.forEach((t) => { if ((b.ids || []).includes(t.id)) { t.to = to; t.toAt = to ? now : ""; } });
  } else if (b.op === "del") {
    if (!A) return adminOnly();
    l = l.filter((t) => !(b.ids || []).includes(t.id));
  } else if (b.op === "carry") {
    if (!A) return adminOnly();
    const to = b.to;
    if (!DRE.test(to || "") || to === date) return J({ error: "Tanggal tujuan tidak valid" }, 400);
    const move = l.filter((t) => t.status !== "Selesai");
    const dest = await load(to);
    for (const t of move) {
      if (dest.some((x) => x.no.toLowerCase() === t.no.toLowerCase() && (x.cat || "") === (t.cat || ""))) continue;
      dest.push({ ...t, id: nid(), date: to, status: "Belum", doneAt: "", at: now, by: u,
        note: ("Dipindah dari " + date + (t.note ? " · " + t.note : "")).slice(0, 300) });
    }
    l = l.filter((t) => t.status === "Selesai");
    await store.setJSON("tasks/" + to, dest);
  } else return J({ error: "unknown op" }, 400);

  await store.setJSON("tasks/" + date, l);
  return J({ tasks: view(l) });
};
