import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageEntry = fileURLToPath(import.meta.resolve("maplibre-gl"));
const distributionDirectory = dirname(packageEntry);
const publicDirectory = join(process.cwd(), "public");
const assets = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];

await mkdir(publicDirectory, { recursive: true });

for (const asset of assets) {
  await copyFile(
    join(distributionDirectory, asset),
    join(publicDirectory, asset),
  );
}

console.log(
  `MapLibre: ${assets.length} assets de worker sincronizados em public/.`,
);
