// @ts-check

import * as DoriosLib from "DoriosLib/index.js";

/**
 * Register addon-owned upgrade items with DoriosCore's shared upgrade system.
 *
 * The values inside `levels` are additive perks. Machine automatically uses
 * the standard perks `speed`, `energy_cost`, `energy_efficiency` and
 * `process_batch`. ThermalMachine additionally reads `max_heat` and
 * `cooling_rate` without requiring a DoriosCore modification.
 */
DoriosLib.registry.registerMachineUpgrade({
  "utilitycraft:example_speed_upgrade": {
    type: "speed",
    levels: {
      1: { speed: 0.25, energy_cost: 0.15 },
      2: { speed: 0.65, energy_cost: 0.35 },
      3: { speed: 1.25, energy_cost: 0.75 },
      4: { speed: 2.0, energy_cost: 1.25 },
    },
  },
  "utilitycraft:example_efficiency_upgrade": {
    type: "energy",
    levels: {
      1: { energy_efficiency: 0.25 },
      2: { energy_efficiency: 0.75 },
      3: { energy_efficiency: 1.5 },
      4: { energy_efficiency: 3.0 },
    },
  },
  "utilitycraft:example_batch_upgrade": {
    type: "batch",
    levels: {
      1: { process_batch: 1, energy_cost: 0.25 },
      2: { process_batch: 2, energy_cost: 0.6 },
      3: { process_batch: 4, energy_cost: 1.25 },
      4: { process_batch: 7, energy_cost: 2.25 },
    },
  },
  "utilitycraft:example_thermal_upgrade": {
    type: "thermal",
    levels: {
      1: { max_heat: 25, cooling_rate: 0.25 },
      2: { max_heat: 60, cooling_rate: 0.6 },
      3: { max_heat: 110, cooling_rate: 1.0 },
      4: { max_heat: 180, cooling_rate: 1.75 },
    },
  },
});

