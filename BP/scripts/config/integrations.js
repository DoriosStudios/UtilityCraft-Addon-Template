// @ts-check

import * as DoriosLib from "DoriosLib/index.js";

/** Add a drop usable by both the official and custom Autosieve meshes. */
DoriosLib.registry.registerSieveDrop({
  "minecraft:gravel": [
    {
      item: "utilitycraft:example_crystal_shard",
      amount: [1, 2],
      chance: 0.08,
      tier: 3,
    },
  ],
});

/** Add one loot entry for every fishing net accepted by UtilityCraft. */
DoriosLib.registry.registerAutoFisherDrop({
  item: "utilitycraft:example_crystal_shard",
  amount: 1,
  chance: 0.025,
  tier: 2,
});

/** Make the template's biomass item a valid UtilityCraft Furnator fuel. */
DoriosLib.registry.registerFuel({
  "utilitycraft:example_biomass": 12_000,
});

/**
 * Register one plant definition for UtilityCraft plant machinery and Bonsai.
 * The physical crop block has its own addon component because UtilityCraft's
 * built-in crop catalog is static; the shared plant registration remains the
 * correct public integration point for harvesters and Bonsai.
 */
DoriosLib.registry.registerPlant({
  "utilitycraft:example_crystal_seeds": {
    cost: 3_200,
    drops: [
      { item: "utilitycraft:example_crystal_shard", amount: [2, 4], chance: 1 },
      { item: "utilitycraft:example_crystal_seeds", amount: 1, chance: 0.15 },
    ],
    bonsai: {
      entityTypeId: "utilitycraft:example_crystal_bonsai",
      allowedSoils: ["minecraft:dirt", "minecraft:grass_block"],
      durationTicks: 1_200,
      speedMultiplier: 1,
      yieldMultiplier: 1,
    },
  },
});

