const fs = require("fs");
const path = require("path");

function normalizeHeroName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

// --- Parse Character CSV ---
const HOME = process.env.USERPROFILE || process.env.HOME;
const charCsv = fs.readFileSync(
  path.join(HOME, "Downloads", "Overwatch - Character (2).csv"),
  "utf-8"
);
const charLines = charCsv.trim().split("\n");
const charHeader = charLines[0].split(",");

const heroes = [];
for (let i = 1; i < charLines.length; i++) {
  // Handle commas in names carefully - this CSV is simple enough
  const parts = charLines[i].split(",");
  const name = parts[0].trim();
  heroes.push({
    name,
    slug: normalizeHeroName(name),
    role: parts[1].trim(),
    subrole: parts[2].trim(),
    isAerial: parts[3].trim() === "Yes",
    canShootAerial: parts[4].trim() === "Yes",
    hasShield: parts[5].trim() === "Yes",
  });
}

console.log(`Parsed ${heroes.length} heroes`);
heroes.forEach((h) => console.log(`  ${h.slug} (${h.name}) - ${h.role}/${h.subrole}`));

// --- Parse Counterwatch CSV ---
const counterCsv = fs.readFileSync(
  path.join(HOME, "Downloads", "Overwatch - Counterwatch (1).csv"),
  "utf-8"
);
const counterLines = counterCsv.trim().split("\n");
const counterHeader = counterLines[0].split(",");

// Column headers (index 1..N) are hero names that do the countering
const columnSlugs = counterHeader.slice(1).map((name) => normalizeHeroName(name.trim()));
console.log(`\nCounter matrix columns: ${columnSlugs.length} heroes`);

// Build the matrix: matrix[counterSlug][targetSlug] = score
const matrix = {};

for (let i = 1; i < counterLines.length; i++) {
  const parts = counterLines[i].split(",");
  const targetName = parts[0].trim();
  const targetSlug = normalizeHeroName(targetName);

  for (let j = 1; j < parts.length; j++) {
    const value = parts[j].trim();
    if (value && !isNaN(parseInt(value))) {
      const counterSlug = columnSlugs[j - 1];
      const score = parseInt(value);
      if (!matrix[counterSlug]) {
        matrix[counterSlug] = {};
      }
      matrix[counterSlug][targetSlug] = score;
    }
  }
}

// Verify: count total counter relationships
let totalCounters = 0;
for (const counter of Object.keys(matrix)) {
  totalCounters += Object.keys(matrix[counter]).length;
}
console.log(`Total counter relationships: ${totalCounters}`);

// Verify slug matching between CSVs
const heroSlugs = new Set(heroes.map((h) => h.slug));
const matrixSlugs = new Set([...columnSlugs, ...Object.keys(matrix)]);
const missingInHeroes = [...matrixSlugs].filter((s) => !heroSlugs.has(s));
const missingInMatrix = [...heroSlugs].filter((s) => !matrixSlugs.has(s));
if (missingInHeroes.length > 0) {
  console.log(`\nWARNING: Slugs in matrix but not in heroes: ${missingInHeroes.join(", ")}`);
}
if (missingInMatrix.length > 0) {
  console.log(`\nWARNING: Slugs in heroes but not in matrix: ${missingInMatrix.join(", ")}`);
}

// --- Write JSON files ---
const dataDir = path.join(__dirname, "..", "src", "data");
fs.mkdirSync(dataDir, { recursive: true });

fs.writeFileSync(
  path.join(dataDir, "heroes.json"),
  JSON.stringify(heroes, null, 2),
  "utf-8"
);
console.log(`\nWrote heroes.json`);

fs.writeFileSync(
  path.join(dataDir, "counter-matrix.json"),
  JSON.stringify(matrix, null, 2),
  "utf-8"
);
console.log(`Wrote counter-matrix.json`);

fs.writeFileSync(
  path.join(dataDir, "users.json"),
  "[]",
  "utf-8"
);
console.log(`Wrote users.json`);
