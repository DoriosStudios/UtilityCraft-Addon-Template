import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const catalogPath = join(projectRoot, "BP", "item_catalog", "crafting_item_catalog.json");
const langPath = join(projectRoot, "RP", "texts", "en_US.lang");
const errors = [];

function jsonFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);
    return entry.isDirectory() ? jsonFiles(entryPath) : extname(entry.name) === ".json" ? [entryPath] : [];
  });
}

const definitions = new Map();
for (const rootName of ["blocks", "items"]) {
  for (const definitionPath of jsonFiles(join(projectRoot, "BP", rootName))) {
    const json = JSON.parse(readFileSync(definitionPath, "utf8"));
    const definition = json["minecraft:block"] ?? json["minecraft:item"];
    const identifier = definition?.description?.identifier;
    if (!identifier) continue;
    definitions.set(identifier, {
      category: definition.description.menu_category?.category,
      path: definitionPath,
    });
  }
}

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
if (catalog.format_version !== "1.21.60") {
  errors.push("catalog format_version must match UtilityCraft: 1.21.60");
}

const lang = readFileSync(langPath, "utf8");
const localizedKeys = new Set(
  lang
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => line.slice(0, line.indexOf("="))),
);

const catalogEntries = new Map();
const categories = catalog["minecraft:crafting_items_catalog"]?.categories ?? [];
for (const category of categories) {
  for (const group of category.groups ?? []) {
    const groupId = group.group_identifier;
    if (!definitions.has(groupId?.icon)) errors.push(`unknown group icon ${groupId?.icon}`);
    if (!localizedKeys.has(groupId?.name)) errors.push(`missing group translation ${groupId?.name}`);

    for (const identifier of group.items ?? []) {
      const definition = definitions.get(identifier);
      if (!definition) {
        errors.push(`unknown catalog item ${identifier}`);
        continue;
      }
      if (catalogEntries.has(identifier)) {
        errors.push(`duplicate catalog item ${identifier}`);
      } else {
        catalogEntries.set(identifier, category.category_name);
      }
      if (definition.category !== category.category_name) {
        errors.push(`${identifier} is in catalog category ${category.category_name}, but its definition uses ${definition.category}`);
      }
    }
  }
}

const visibleDefinitions = [...definitions.entries()].filter(([, definition]) =>
  definition.category && definition.category !== "none"
);
for (const [identifier] of visibleDefinitions) {
  if (!catalogEntries.has(identifier)) errors.push(`visible definition missing from catalog: ${identifier}`);
}

if (errors.length > 0) {
  throw new Error(`Invalid crafting item catalog:\n${errors.join("\n")}`);
}

console.log(`Verified ${catalogEntries.size} creative inventory entries across ${categories.length} categories.`);
