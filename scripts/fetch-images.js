const fs = require("fs");
const path = require("path");

async function main() {
  const res = await fetch("https://overfast-api.tekrop.fr/heroes");
  const apiHeroes = await res.json();

  console.log(`Fetched ${apiHeroes.length} heroes from OverFast API`);

  // Build a lookup by normalized key
  const apiLookup = {};
  for (const h of apiHeroes) {
    const key = h.key.toLowerCase().replace(/[^a-z0-9]/g, "");
    apiLookup[key] = h;
    // Also store by exact key
    apiLookup[h.key] = h;
  }

  // Load our heroes.json
  const heroesPath = path.join(__dirname, "..", "src", "data", "heroes.json");
  const heroes = JSON.parse(fs.readFileSync(heroesPath, "utf-8"));

  // Name mapping for heroes that don't match directly
  const slugToApiKey = {
    dva: "dva",
    ball: "wrecking-ball",
    hog: "roadhog",
    reinhart: "reinhardt",
    soldier: "soldier-76",
    phara: "pharah",
    ash: "ashe",
    torbjrn: "torbjorn",
    illary: "illari",
    jetpackcat: "jetpack-cat",
    junkerqueen: "junker-queen",
    domina: "domina",
  };

  let matched = 0;
  let unmatched = [];

  for (const hero of heroes) {
    // Try direct slug match
    let apiHero = apiLookup[hero.slug];

    // Try mapped key
    if (!apiHero && slugToApiKey[hero.slug]) {
      apiHero = apiLookup[slugToApiKey[hero.slug]];
    }

    // Try lowercase name match
    if (!apiHero) {
      apiHero = apiHeroes.find(
        (h) => h.name.toLowerCase() === hero.name.toLowerCase()
      );
    }

    if (apiHero && apiHero.portrait) {
      hero.imageUrl = apiHero.portrait;
      matched++;
      console.log(`  ✓ ${hero.name} → ${apiHero.name} (${apiHero.key})`);
    } else {
      unmatched.push(hero.name);
      console.log(`  ✗ ${hero.name} (slug: ${hero.slug}) - NO MATCH`);
    }
  }

  console.log(`\nMatched: ${matched}/${heroes.length}`);
  if (unmatched.length > 0) {
    console.log(`Unmatched: ${unmatched.join(", ")}`);
    console.log("\nAvailable API keys:");
    apiHeroes.forEach((h) => console.log(`  ${h.key} → ${h.name}`));
  }

  fs.writeFileSync(heroesPath, JSON.stringify(heroes, null, 2), "utf-8");
  console.log("\nUpdated heroes.json with image URLs");
}

main().catch(console.error);
