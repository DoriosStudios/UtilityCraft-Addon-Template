import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const namespace = "utilitycraft";
const resourceRegistryPath = join(projectRoot, "BP", "scripts", "config", "resources.js");
const resourceRegistry = readFileSync(resourceRegistryPath, "utf8");
const resourceKinds = new Map();

for (const [registryName, kind] of [["registerFluidItem", "fluid"], ["registerGasItem", "gas"]]) {
  const block = resourceRegistry.match(new RegExp(`${registryName}\\(\\{([\\s\\S]*?)\\n\\}\\);`))?.[1] ?? "";
  for (const match of block.matchAll(/\btype:\s*"([^"]+)"/g)) {
    resourceKinds.set(match[1], kind);
  }
}

const resources = [...resourceKinds.keys()].sort();

if (resources.length === 0) {
  throw new Error("No registered fluid or gas types were found in resources.js.");
}

const atlasPath = join(projectRoot, "RP", "textures", "item_texture.json");
const atlas = JSON.parse(readFileSync(atlasPath, "utf8")).texture_data;
const terrainAtlasPath = join(projectRoot, "RP", "textures", "terrain_texture.json");
const terrainAtlas = JSON.parse(readFileSync(terrainAtlasPath, "utf8")).texture_data;
const blocksJsonPath = join(projectRoot, "RP", "blocks.json");
const blocksJson = JSON.parse(readFileSync(blocksJsonPath, "utf8"));
const missing = [];

for (const resource of resources) {
  const kind = resourceKinds.get(resource);
  for (let index = 0; index <= 48; index++) {
    const frame = String(index).padStart(2, "0");
    const identifier = `${namespace}:${resource}_${frame}`;
    const itemPath = join(
      projectRoot,
      "BP",
      "items",
      "ui",
      "resource_bars",
      resource,
      `${namespace}_${resource}_${frame}.json`,
    );
    const texturePath = join(
      projectRoot,
      "RP",
      "textures",
      "ui",
      `${resource}_bar`,
      `${resource}_${frame}.png`,
    );

    if (!existsSync(itemPath)) {
      missing.push(`item ${identifier}`);
    } else {
      const item = JSON.parse(readFileSync(itemPath, "utf8"))["minecraft:item"];
      if (item?.description?.identifier !== identifier) {
        missing.push(`item identifier ${identifier}`);
      }
      if (item?.components?.["minecraft:icon"] !== identifier) {
        missing.push(`item icon ${identifier}`);
      }
    }

    if (!existsSync(texturePath)) {
      missing.push(`texture ${identifier}`);
    } else {
      const png = readFileSync(texturePath);
      const isPng = png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      const width = isPng ? png.readUInt32BE(16) : 0;
      const height = isPng ? png.readUInt32BE(20) : 0;
      if (!isPng || width !== 48 || height !== 48) {
        missing.push(`48x48 PNG ${identifier}`);
      }
    }

    const expectedTexture = `textures/ui/${resource}_bar/${resource}_${frame}`;
    if (atlas[identifier]?.textures !== expectedTexture) {
      missing.push(`atlas entry ${identifier}`);
    }
  }

  const entityPrefix = kind === "fluid" ? "fluid_tank" : "gas_tank";
  const entityIdentifier = `${namespace}:${entityPrefix}_${resource}`;
  const entityFolder = kind === "fluid" ? "fluids" : "gases";
  const textureSuffix = kind === "fluid" ? "fluid" : "gas";
  const bpEntityPath = join(projectRoot, "BP", "entities", entityFolder, `${entityPrefix}_${resource}.json`);
  const rpEntityPath = join(projectRoot, "RP", "entity", entityFolder, `${entityPrefix}_${resource}.json`);
  const entityTexturePath = join(projectRoot, "RP", "textures", "entity", `${resource}_${textureSuffix}.png`);

  if (!existsSync(bpEntityPath)) {
    missing.push(`BP entity ${entityIdentifier}`);
  } else {
    const entity = JSON.parse(readFileSync(bpEntityPath, "utf8"))["minecraft:entity"];
    if (entity?.description?.identifier !== entityIdentifier) {
      missing.push(`BP entity identifier ${entityIdentifier}`);
    }
    const family = entity?.components?.["minecraft:type_family"]?.family ?? [];
    if (!family.includes(`dorios:${kind}_container`)) {
      missing.push(`BP entity family ${entityIdentifier}`);
    }
  }

  if (!existsSync(rpEntityPath)) {
    missing.push(`RP client entity ${entityIdentifier}`);
  } else {
    const client = JSON.parse(readFileSync(rpEntityPath, "utf8"))["minecraft:client_entity"]?.description;
    const expectedGeometry = `geometry.utilitycraft_${kind}_tank_entity`;
    const expectedEntityTexture = `textures/entity/${resource}_${textureSuffix}`;
    if (client?.identifier !== entityIdentifier) missing.push(`RP entity identifier ${entityIdentifier}`);
    if (client?.geometry?.default !== expectedGeometry) missing.push(`RP entity geometry ${entityIdentifier}`);
    if (client?.textures?.default !== expectedEntityTexture) missing.push(`RP entity texture ${entityIdentifier}`);
  }

  if (!existsSync(entityTexturePath)) {
    missing.push(`entity texture ${entityIdentifier}`);
  } else {
    const png = readFileSync(entityTexturePath);
    const isPng = png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const width = isPng ? png.readUInt32BE(16) : 0;
    const height = isPng ? png.readUInt32BE(20) : 0;
    if (!isPng || width !== 16 || height !== 16) {
      missing.push(`16x16 entity PNG ${entityIdentifier}`);
    }
  }

  const shortName = resource.startsWith("example_") ? resource.slice("example_".length) : resource;
  const creativeBlockIdentifier = `${namespace}:example_creative_${shortName}_tank`;
  const creativeBlockPath = join(
    projectRoot,
    "BP",
    "blocks",
    "examples",
    "creative_tanks",
    `example_creative_${shortName}_tank.json`,
  );
  const expectedCreativeGeometry = `geometry.utilitycraft_creative_${kind}_tank`;
  const expectedTankTexture = `utilitycraft_example_creative_${kind}_tank`;
  const expectedResourceTexture = `utilitycraft_${resource}_${kind}`;

  if (!existsSync(creativeBlockPath)) {
    missing.push(`creative tank ${creativeBlockIdentifier}`);
  } else {
    const block = JSON.parse(readFileSync(creativeBlockPath, "utf8"))["minecraft:block"];
    const infiniteTank = block?.components?.["utilitycraft:infinite_tank"];
    const materials = block?.components?.["minecraft:material_instances"];
    if (block?.description?.identifier !== creativeBlockIdentifier) {
      missing.push(`creative tank identifier ${creativeBlockIdentifier}`);
    }
    if (infiniteTank?.resource !== kind || infiniteTank?.type !== resource) {
      missing.push(`creative tank component ${creativeBlockIdentifier}`);
    }
    if (block?.components?.["minecraft:geometry"] !== expectedCreativeGeometry) {
      missing.push(`creative tank geometry ${creativeBlockIdentifier}`);
    }
    if (materials?.["*"]?.texture !== expectedTankTexture) {
      missing.push(`creative tank shell ${creativeBlockIdentifier}`);
    }
    if (materials?.[kind]?.texture !== expectedResourceTexture) {
      missing.push(`creative tank resource material ${creativeBlockIdentifier}`);
    }
  }

  const expectedTerrainPath = `textures/entity/${resource}_${textureSuffix}`;
  if (terrainAtlas[expectedResourceTexture]?.textures !== expectedTerrainPath) {
    missing.push(`terrain atlas resource ${creativeBlockIdentifier}`);
  }
  if (blocksJson[creativeBlockIdentifier]?.sound !== "metal") {
    missing.push(`RP block sound ${creativeBlockIdentifier}`);
  }
}

for (const [kind, width, height] of [["fluid", 32, 16], ["gas", 64, 64]]) {
  const key = `utilitycraft_example_creative_${kind}_tank`;
  const expectedPath = `textures/blocks/examples/creative_${kind}_tank`;
  const texturePath = join(projectRoot, "RP", `${expectedPath}.png`);
  if (terrainAtlas[key]?.textures !== expectedPath) missing.push(`terrain atlas ${key}`);
  if (!existsSync(texturePath)) {
    missing.push(`creative ${kind} tank texture`);
  } else {
    const png = readFileSync(texturePath);
    const isPng = png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    if (!isPng || png.readUInt32BE(16) !== width || png.readUInt32BE(20) !== height) {
      missing.push(`${width}x${height} creative ${kind} tank PNG`);
    }
  }
}

if (missing.length > 0) {
  throw new Error(`Missing resource display assets:\n${missing.join("\n")}`);
}

console.log(`Verified ${resources.length * 49} display frames, ${resources.length} resource entities and ${resources.length} creative tanks.`);
