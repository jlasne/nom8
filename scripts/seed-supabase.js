// scripts/seed-supabase.js
// Run once: node scripts/seed-supabase.js
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local

const fs = require("fs");
const path = require("path");

// Load .env.local manually
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim();
  process.env[key] = val;
}

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // Load local JSON files
  const heroesPath = path.join(__dirname, "..", "src", "data", "heroes.json");
  const matrixPath = path.join(__dirname, "..", "src", "data", "counter-matrix.json");

  const heroes = JSON.parse(fs.readFileSync(heroesPath, "utf-8"));
  const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf-8"));

  console.log(`Seeding ${heroes.length} heroes...`);

  // Upsert heroes
  const heroRows = heroes.map((h) => ({
    slug: h.slug,
    name: h.name,
    role: h.role,
    subrole: h.subrole,
    is_aerial: h.isAerial || false,
    can_shoot_aerial: h.canShootAerial || false,
    has_shield: h.hasShield || false,
    image_url: h.imageUrl || null,
  }));

  const { error: heroError } = await supabase
    .from("heroes")
    .upsert(heroRows, { onConflict: "slug" });

  if (heroError) {
    console.error("Hero upsert failed:", heroError.message);
    process.exit(1);
  }
  console.log(`  ✓ ${heroRows.length} heroes upserted`);

  // Build counter_matrix rows
  const matrixRows = [];
  for (const [counterSlug, targets] of Object.entries(matrix)) {
    for (const [targetSlug, score] of Object.entries(targets)) {
      if (score > 0) {
        matrixRows.push({ counter_slug: counterSlug, target_slug: targetSlug, score });
      }
    }
  }

  console.log(`Seeding ${matrixRows.length} counter matrix entries...`);

  // Upsert in batches of 500
  const batchSize = 500;
  for (let i = 0; i < matrixRows.length; i += batchSize) {
    const batch = matrixRows.slice(i, i + batchSize);
    const { error: matrixError } = await supabase
      .from("counter_matrix")
      .upsert(batch, { onConflict: "counter_slug,target_slug" });

    if (matrixError) {
      console.error("Matrix upsert failed:", matrixError.message);
      process.exit(1);
    }
    console.log(`  ✓ Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} rows`);
  }

  console.log("\nSeed complete!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
