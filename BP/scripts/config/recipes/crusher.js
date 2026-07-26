// @ts-check

import * as DoriosLib from "DoriosLib/index.js";

/** Extend UtilityCraft's Crusher and Hammer with one custom input. */
DoriosLib.registry.registerCrusherRecipe({
  "utilitycraft:example_crystal_shard": {
    output: "minecraft:amethyst_shard", // Item created by one operation.
    required: 1, // Input items consumed per operation.
    amount: 2, // Output items created per operation.
    tier: 2, // Minimum Hammer tier for manual processing.
    cost: 1_200, // Dorios Energy used by the Crusher.
  },
});
