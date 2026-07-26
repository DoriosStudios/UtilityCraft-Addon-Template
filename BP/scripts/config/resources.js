// @ts-check

import * as DoriosLib from "DoriosLib/index.js";

const FLUID_CAPSULE_AMOUNT = 4_000;
const GAS_CAPSULE_AMOUNT = 4_000;

// FluidStorage.display() and GasStorage.display() render the current level by
// placing `${type}_00` through `${type}_48` in the configured display slot.
// Every custom type below therefore has the complete item and texture sequence
// under BP/items/ui/resource_bars and RP/textures/ui. Tank insertion also
// spawns `utilitycraft:fluid_tank_${type}` or `utilitycraft:gas_tank_${type}`,
// so every type has a matching BP entity and RP client entity/texture.

/**
 * Two custom liquids are included:
 * - example_coolant: consumed by the fluid washer and accepted as a coolant.
 * - example_biofuel: a second type that demonstrates tank type conflicts.
 */
DoriosLib.registry.registerFluidItem({
  "utilitycraft:example_coolant_capsule": {
    type: "example_coolant",
    amount: FLUID_CAPSULE_AMOUNT,
    output: "utilitycraft:example_empty_fluid_capsule",
  },
  "utilitycraft:example_biofuel_capsule": {
    type: "example_biofuel",
    amount: FLUID_CAPSULE_AMOUNT,
    output: "utilitycraft:example_empty_fluid_capsule",
  },
});

DoriosLib.registry.registerFluidHolder({
  "utilitycraft:example_empty_fluid_capsule": {
    required: FLUID_CAPSULE_AMOUNT,
    types: {
      example_coolant: "utilitycraft:example_coolant_capsule",
      example_biofuel: "utilitycraft:example_biofuel_capsule",
    },
  },
});

/** Register the custom coolant for UtilityCraft machines that consume coolant. */
DoriosLib.registry.registerCoolant({
  example_coolant: { efficiency: 1.25, tier: 1 },
});

/**
 * Two custom gases are included:
 * - example_hydrogen: fuel for the gas turbine.
 * - example_exhaust: by-product produced by the gas reactor machine.
 */
DoriosLib.registry.registerGasItem({
  "utilitycraft:example_hydrogen_capsule": {
    type: "example_hydrogen",
    amount: GAS_CAPSULE_AMOUNT,
    output: "utilitycraft:example_empty_gas_capsule",
  },
  "utilitycraft:example_exhaust_capsule": {
    type: "example_exhaust",
    amount: GAS_CAPSULE_AMOUNT,
    output: "utilitycraft:example_empty_gas_capsule",
  },
});

DoriosLib.registry.registerGasHolder({
  "utilitycraft:example_empty_gas_capsule": {
    required: GAS_CAPSULE_AMOUNT,
    types: {
      example_hydrogen: "utilitycraft:example_hydrogen_capsule",
      example_exhaust: "utilitycraft:example_exhaust_capsule",
    },
  },
});
