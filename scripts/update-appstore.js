// scripts/update-appstore.js
// Node 20+ 에서 fetch 내장 사용. 한국 App Store 무료 Top 10 수집.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_PATH = path.join(__dirname, "..", "data", "appstore-kr.json");
const RSS_URL =
  "https://rss.applemarketingtools.com/api/v2/kr/apps/top-free/10/apps.json";

async function main() {
  try {
    const res = await fetch(RSS_URL, { headers: { "User-Agent": "Top10Bot/1.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();

    const results = raw?.feed?.results || [];
    const items = results.slice(0, 10).map((e, i) => ({
      rank: i + 1,
      title: e?.name,
      artist: e?.artistName,
      category: (e?.genres?.[0]?.name) || "",
      url: e?.url,
      icon: e?.artworkUrl100,
      price: "무료",
    }));

    const payload = {
      updatedAt: new Date().toISOString(),
      items,
    };

    // 폴더 보장 후 저장
    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2), "utf-8");
    console.log(`✅ Wrote ${items.length} items to ${OUT_PATH}`);
  } catch (err) {
    console.error("❌ Update failed:", err.message);
    process.exit(1);
  }
}

main();
