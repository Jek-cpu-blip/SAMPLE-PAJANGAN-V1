/* ====================================================================
   VERSI WEBSITE
   File ini diisi otomatis oleh Claude pada setiap pembaruan
   (APP_VERSION, APP_DATE, dan catatan baru paling atas di CHANGELOG).
   Waktu deploy ditampilkan otomatis dari public/build.json yang dibuat
   Netlify saat build (scripts/stamp.mjs).
   ==================================================================== */
const APP_VERSION = "1.0.1";
const APP_DATE = "2026-11-16";
const CHANGELOG = [
  {
    v: "1.0.1",
    date: "2026-11-16",
    items: [
      "Menampilkan waktu deploy terakhir secara otomatis dari Netlify di bawah judul halaman",
    ],
  },
  {
    v: "1.0.0",
    date: "2026-11-16",
    items: [
      "Input sample pajangan lewat item code atau scan barcode kamera, dengan lebih dari satu lokasi per item",
      "Monitoring semua item Flooring and Wall, termasuk item yang hanya ada di DC, dengan filter status, kategori, master brand, lokasi, dan urutan",
      "Status Aman, Request stock, Take out, dan Tidak dianjurkan sample berdasarkan stok toko dan lot production no di DC",
      "Data stok toko dan DC bisa diperbarui dari website dan dibagikan ke semua pengguna",
      "Tab Promo: cek promo dan POP, scan barcode, promo brand lewat brand code, diagnosa data",
      "Update Harian: penugasan update promo per kategori dan monitoring progres",
      "Monitor Perubahan Promo: per tanggal mulai/berakhir, dan promo yang hilang/berubah setelah import data",
      "Data promo bisa disimpan ke server tanpa deploy ulang",
      "Tampilan ramah HP dan logo website",
    ],
  },
];

(function () {
  const fmt = (d) => new Date(d + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const el = document.getElementById("ver");
  if (!el) return;
  el.innerHTML = 'Versi ' + APP_VERSION + ' · diperbarui ' + fmt(APP_DATE) +
    ' <button class="chip" id="verBtn" style="padding:3px 10px;margin-left:6px">Riwayat perubahan</button><div id="verDeploy"></div>';
  fetch("/build.json", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (b) {
      if (!b || !b.deployedAt) return;
      const t = new Date(b.deployedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });
      document.getElementById("verDeploy").textContent = "Deploy terakhir: " + t + " WIB" + (b.commit ? " · build " + b.commit : "");
    })
    .catch(function () {});
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  document.getElementById("verBtn").addEventListener("click", function () {
    const m = document.createElement("div");
    m.setAttribute("role", "dialog");
    m.setAttribute("aria-label", "Riwayat perubahan");
    m.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:70;display:flex;align-items:center;justify-content:center;padding:14px";
    m.innerHTML =
      '<div style="background:var(--card);color:var(--tx);border:1px solid var(--bd);border-radius:12px;max-width:560px;width:100%;max-height:80vh;overflow:auto;padding:16px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b style="font-size:17px">Riwayat perubahan</b><button class="chip" id="verX">Tutup</button></div>' +
      CHANGELOG.map(function (c) {
        return '<div style="margin:12px 0"><b>v' + esc(c.v) + '</b> <span style="color:var(--mu);font-size:13px">· ' + fmt(c.date) + '</span><ul style="margin:6px 0 0;padding-left:20px">' +
          c.items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul></div>";
      }).join("") + "</div>";
    const close = function () { m.remove(); };
    m.addEventListener("click", function (e) { if (e.target === m || e.target.id === "verX") close(); });
    document.addEventListener("keydown", function esc2(e) { if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc2); } });
    document.body.appendChild(m);
  });
})();
