// @ts-check

import * as DoriosLib from "DoriosLib/index.js";

/**
 * UtilityCraft Furnace recipes follow the standard single-item recipe shape.
 * This example also shows that `amount` and `cost` can override their defaults.
 */
DoriosLib.registry.registerFurnaceRecipe({
  "utilitycraft:example_energized_alloy": {
    output: "minecraft:iron_ingot",
    required: 1,
    amount: 2,
    cost: 1_200,
  },
});

