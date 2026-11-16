// Dijalankan otomatis oleh Netlify setiap deploy: mencatat waktu deploy dan commit.
import { writeFileSync, mkdirSync } from "node:fs";

try {
  mkdirSync("public", { recursive: true });
  writeFileSync(
    "public/build.json",
    JSON.stringify({
      deployedAt: new Date().toISOString(),
      commit: (process.env.COMMIT_REF || "").slice(0, 7),
    })
  );
  console.log("build.json dibuat");
} catch (e) {
  console.log("Lewati cap waktu:", e.message); // jangan menggagalkan deploy
}
