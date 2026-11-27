import { getStore } from "@netlify/blobs";
import { USERS } from "../lib/users.mjs";

export const config = { path: "/api/findings" };

const H = { "content-type": "application/json", "cache-control": "no-store" };
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: H });
const STS = ["Belum diproses", "Sedang dipasang", "Sudah dipasang"];
const STAFF = Object.keys(USERS).filter((u) => USERS[u][1] === "staff");
const cl = (s, n) => String(s ?? "").slice(0, n);

export default async (req) => {
  const u = String(req.headers.get("x-cp-user") || "").trim().toLowerCase();
  const e = USERS[u];
  if (!e || e[0] !== (req.headers.get("x-cp-hash") || ""))
    return J({ error: "Login tidak valid. Silakan login ulang." }, 401);
  const A = e[1] === "admin";

  const store = getStore({ name: "findings", consistency: "strong" });
  let list = (await store.get("list", { type: "json" })) || [];
  const view = (l) => (A ? l : l.filter((f) => f.to === u));
  const url = new URL(req.url);

  if (req.method === "GET") {
    const k = url.searchParams.get("photo");
    if (k) {
      const f = list.find((x) => x.id === String(k).split("_")[0]);
      if (!f || (!A && f.to !== u)) return J({ error: "tidak boleh" }, 403);
      const p = await store.get("photo/" + k, { type: "json" });
      return J({ d: p ? p.d : null });
    }
    return J({ items: view(list) });
  }
  if (req.method !== "POST") return J({ error: "method not allowed" }, 405);

  let b;
  try { b = await req.json(); } catch { return J({ error: "bad json" }, 400); }
  const now = new Date().toISOString();
  const ids = Array.isArray(b.ids) ? b.ids.map(String) : [];
  const deny = () => J({ error: "Khusus admin" }, 403);
  const dropPhotos = async (fs) => {
    for (const f of fs) for (const p of f.fotos || []) await store.delete("photo/" + p.k);
  };
  const mine = (f) => A || f.to === u;

  if (b.op === "add") {
    if (!A) return deny();
    for (const it of (b.items || []).slice(0, 500)) {
      if (!it || !it.id || JSON.stringify(it).length > 4000) continue;
      if (list.some((x) => x.id === it.id)) continue;
      list.push({ ...it, id: String(it.id), fotos: Array.isArray(it.fotos) ? it.fotos : [] });
    }
  } else if (b.op === "update") {
    const f = list.find((x) => x.id === String(b.id));
    if (!f) return J({ error: "Temuan tidak ditemukan" }, 404);
    if (!mine(f)) return J({ error: "Bukan tugas Anda" }, 403);
    if (b.status !== undefined) {
      if (!STS.includes(b.status)) return J({ error: "Status tidak valid" }, 400);
      if (!A && b.status === STS[2] && !(f.fotos || []).length)
        return J({ error: "Tambahkan minimal 1 foto bukti sebelum menandai Sudah dipasang." }, 400);
      f.status = b.status;
    }
    if (b.note !== undefined) f.note = cl(b.note, 300);
    f.by = u; f.at = now;
  } else if (b.op === "assign") {
    if (!A) return deny();
    const to = STAFF.includes(b.to) ? b.to : "";
    list.forEach((f) => { if (ids.includes(f.id)) { f.to = to; f.toAt = to ? now : ""; f.toBy = u; } });
  } else if (b.op === "del") {
    if (!A) return deny();
    await dropPhotos(list.filter((f) => ids.includes(f.id)));
    list = list.filter((f) => !ids.includes(f.id));
  } else if (b.op === "clearDone") {
    if (!A) return deny();
    await dropPhotos(list.filter((f) => f.status === STS[2]));
    list = list.filter((f) => f.status !== STS[2]);
  } else if (b.op === "delAll") {
    if (!A) return deny();
    await dropPhotos(list);
    list = [];
  } else if (b.op === "photoAdd") {
    const f = list.find((x) => x.id === String(b.id));
    if (!f) return J({ error: "Temuan tidak ditemukan" }, 404);
    if (!mine(f)) return J({ error: "Bukan tugas Anda" }, 403);
    const k = String(b.k || "");
    if (!k.startsWith(f.id + "_") || k.length > 80) return J({ error: "kunci foto tidak valid" }, 400);
    if (typeof b.d !== "string" || !b.d.startsWith("data:image/") || b.d.length > 1400000)
      return J({ error: "Foto tidak valid atau terlalu besar" }, 400);
    f.fotos = f.fotos || [];
    if (f.fotos.length >= 3 && !f.fotos.some((p) => p.k === k)) return J({ error: "Maksimal 3 foto per temuan." }, 400);
    await store.setJSON("photo/" + k, { d: b.d });
    if (!f.fotos.some((p) => p.k === k))
      f.fotos.push(A && b.imp ? { k, by: cl(b.by, 60), at: cl(b.at, 40) } : { k, by: u, at: now });
  } else if (b.op === "photoDel") {
    const f = list.find((x) => x.id === String(b.id));
    if (!f) return J({ error: "Temuan tidak ditemukan" }, 404);
    if (!(A || (f.to === u && f.status !== STS[2]))) return J({ error: "Tidak boleh menghapus foto ini" }, 403);
    f.fotos = (f.fotos || []).filter((p) => p.k !== String(b.k));
    await store.delete("photo/" + String(b.k));
  } else return J({ error: "unknown op" }, 400);

  await store.setJSON("list", list);
  return J({ items: view(list) });
};
