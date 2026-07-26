// @ts-check

import * as DoriosLib from "DoriosLib/index.js";

/**
 * Infuser recipe keys always use `catalyst|baseItem` order.
 *
 * Every supported parameter is shown explicitly:
 * - output: item produced;
 * - required: catalyst units consumed;
 * - input_required: base-item units consumed;
 * - amount: output units produced;
 * - cost: Dorios Energy consumed for each operation.
 */
const INFUSER_RECIPES = {
  "minecraft:amethyst_shard|minecraft:copper_ingot": {
    output: "utilitycraft:example_energized_alloy",
    required: 2,
    input_required: 1,
    amount: 1,
    cost: 1_800,
  },
  "minecraft:glowstone_dust|minecraft:iron_ingot": {
    output: "utilitycraft:example_crystal_shard",
    required: 1,
    input_required: 2,
    amount: 3,
    cost: 1_200,
  },
};

DoriosLib.registry.registerInfuserRecipe(INFUSER_RECIPES);

