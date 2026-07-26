// @ts-check

import * as DoriosLib from "DoriosLib/index.js";
import { expandRecipePlaceholder } from "ExampleCore/index.js";

/**
 * Electro Press recipes use one input item as the object key.
 * - output: item produced;
 * - required: input units consumed;
 * - amount: output units produced;
 * - cost: Dorios Energy consumed per operation.
 */
const PRESS_RECIPES = {
  "utilitycraft:example_crystal_shard": {
    output: "minecraft:amethyst_block",
    required: 4,
    amount: 1,
    cost: 1_600,
  },
};

DoriosLib.registry.registerPressRecipe(PRESS_RECIPES);

/**
 * Optional advanced example: expand one `{wood}` template into three concrete
 * recipes. UtilityCraft receives ordinary IDs; it never sees the placeholder.
 */
const WOOD_PRESS_RECIPES = expandRecipePlaceholder(
  {
    "minecraft:{wood}_log": {
      output: "minecraft:{wood}_planks",
      required: 1,
      amount: 8,
      cost: 400,
    },
  },
  "wood",
  ["oak", "birch", "spruce"],
);

DoriosLib.registry.registerPressRecipe(WOOD_PRESS_RECIPES);
