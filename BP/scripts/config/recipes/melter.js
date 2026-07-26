// @ts-check

import * as DoriosLib from "DoriosLib/index.js";

/**
 * Magmatic Chamber recipes are registered through the Melter registry.
 * - liquid: resulting registered fluid type;
 * - amount: millibuckets produced from one input item;
 * - cost: Dorios Energy consumed per operation.
 *
 * Unlike item-output recipes, the current Melter contract consumes exactly one
 * input item per operation and therefore has no `required` field.
 */
const MELTER_RECIPES = {
  "utilitycraft:example_biomass": {
    liquid: "example_biofuel",
    amount: 500,
    cost: 1_000,
  },
  "utilitycraft:example_crystal_shard": {
    liquid: "example_coolant",
    amount: 250,
    cost: 1_400,
  },
};

DoriosLib.registry.registerMelterRecipe(MELTER_RECIPES);

