// @ts-check

import { ItemStack } from "@minecraft/server";
import {
  EnergyStorage,
  Multiblock,
  MultiblockMachine,
  registerLinkNodeIO,
} from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";

const BLOCK_ID = "utilitycraft:example_factory_crusher";
const INPUT_SLOT = 3;
const OUTPUT_SLOT = 4;
const BASE_COST = 1_200;

// Processing recipes demonstrated by the Factory Crusher.
const RECIPES = Object.freeze({
  "minecraft:cobblestone": { output: "minecraft:gravel", amount: 1 },
  "minecraft:gravel": { output: "minecraft:sand", amount: 1 },
  "utilitycraft:example_crystal_shard": { output: "minecraft:amethyst_shard", amount: 2 },
});

const CONFIG = {
  required_case: "dorios:multiblock.case.example",
  entity: {
    identifier: "utilitycraft:example_multiblock_machine",
    type: "simple_machine",
    name: "example_factory_crusher",
    inventory_size: 5,
    input_range: /** @type {[number, number]} */ ([INPUT_SLOT, INPUT_SLOT]),
    output_range: /** @type {[number, number]} */ ([OUTPUT_SLOT, OUTPUT_SLOT]),
  },
  machine: {
    // DoriosCore uses this as the base amount of work performed per tick.
    rate_speed_base: 100,
    // Custom energy cells are calculated in onActivate below.
    energy_cap: 0,
  },
  requirements: {
    example_energy_cell: {
      amount: 1,
      warning: "\u00A7c[Factory Crusher] Add at least one Example Energy Cell inside.",
    },
    example_processing_module: {
      amount: 1,
      warning: "\u00A7c[Factory Crusher] Add one Example Processing Module inside.",
    },
  },
};

// Link-node declarations describe logical destinations, not physical sides.
// Each active item port lets the player choose between these groups.
registerLinkNodeIO(BLOCK_ID, {
  items: {
    anyInputSlots: [INPUT_SLOT],
    anyOutputSlots: [OUTPUT_SLOT],
    inputs: [{ id: "material", label: "Material Input", color: "\u00A79", slots: [INPUT_SLOT] }],
    outputs: [{ id: "product", label: "Product Output", color: "\u00A7c", slots: [OUTPUT_SLOT] }],
  },
});

DoriosLib.registry.blockComponent(BLOCK_ID, {
  onPlayerInteract(event) {
    return MultiblockMachine.handlePlayerInteract(event, CONFIG, {
      onActivate({ entity, components }) {
        // DoriosCore deliberately knows only its own built-in component IDs.
        // Addons calculate capacities for custom components in their own core.
        const capacity = (components.example_energy_cell ?? 0) * 2_000_000;
        EnergyStorage.setCap(entity, capacity);
        entity.setDynamicProperty("dorios:energyCap", capacity);

        const stats = createAddonStats(components);
        entity.setDynamicProperty("components", JSON.stringify(stats));
      },
      successMessages({ components }) {
        const capacity = (components.example_energy_cell ?? 0) * 2_000_000;
        return [
          "\u00A7a[Factory Crusher] Structure activated.",
          `\u00A77Energy capacity: \u00A7b${EnergyStorage.formatEnergyToText(capacity)}`,
          "\u00A77Open a port to choose its IO route.",
        ];
      },
    });
  },

  onPlayerBreak({ block, player }) {
    Multiblock.DeactivationManager.handleBreakController(block, player);
  },

  onTick({ block }) {
    const machine = new MultiblockMachine(block, CONFIG);
    if (!machine.valid) return;

    machine.processIO();
    const stats = readStats(machine.entity);
    machine.setRateMultiplier(stats.speed.multiplier);
    machine.setEnergyCost(BASE_COST);
    // The standard machine screen renders inventory slot 2 as progress. Draw
    // it before early returns so paused and blocked states remain visible.
    machine.displayProgress();

    const input = machine.container.getItem(INPUT_SLOT);
    const recipe = input ? RECIPES[input.typeId] : undefined;
    if (!input || !recipe) {
      showStatus(machine, stats, "\u00A7eNo Recipe");
      machine.setProgress(0);
      return;
    }

    const output = machine.container.getItem(OUTPUT_SLOT);
    const perCraft = recipe.amount;
    const maxByInput = Math.min(input.amount, stats.processing.amount);
    const maxByOutput = output
      ? output.typeId === recipe.output
        ? Math.floor((output.maxAmount - output.amount) / perCraft)
        : 0
      : Math.floor(64 / perCraft);
    const batch = Math.min(maxByInput, maxByOutput);

    if (batch <= 0) {
      showStatus(machine, stats, "\u00A7eOutput Full");
      return;
    }

    const totalCost = BASE_COST * batch * stats.energyMultiplier;
    machine.setEnergyCost(totalCost);
    const spent = Math.min(machine.energy.get(), machine.rate, totalCost - machine.getProgress());
    if (spent > 0) {
      machine.energy.consume(spent);
      machine.addProgress(spent);
    }

    if (machine.getProgress() >= totalCost) {
      input.amount -= batch;
      machine.container.setItem(INPUT_SLOT, input.amount > 0 ? input : undefined);

      const result = output ?? new ItemStack(recipe.output, batch * perCraft);
      if (output) result.amount += batch * perCraft;
      machine.container.setItem(OUTPUT_SLOT, result);
      machine.setProgress(0);
    }

    machine.displayProgress();
    machine.displayEnergy();
    showStatus(machine, { ...stats, cost: totalCost }, spent > 0 ? "\u00A7aRunning" : "\u00A7eNo Energy");
  },
});

/** Converts addon-owned component IDs into the standard DoriosCore stat shape. */
function createAddonStats(components) {
  const processing = Math.max(1, components.example_processing_module ?? 0);
  const speed = Math.max(0, components.example_speed_module ?? 0);
  const efficiency = Math.max(0, components.example_efficiency_module ?? 0);
  const batch = 1 + processing;
  const speedMultiplier = 1 + speed * 0.25;
  const energyMultiplier = Math.max(0.35, 1 + speed * 0.15 + processing * 0.2 - efficiency * 0.12);

  return {
    raw: { processing, speed, efficiency },
    processing: { amount: batch, penalty: 1 + processing * 0.2 },
    speed: { multiplier: speedMultiplier, penalty: 1 + speed * 0.15 },
    efficiency: { multiplier: Math.max(0.35, 1 - efficiency * 0.12) },
    energyMultiplier,
  };
}

function readStats(entity) {
  const value = entity.getDynamicProperty("components");
  return typeof value === "string" ? JSON.parse(value) : createAddonStats({});
}

function showStatus(machine, stats, status) {
  machine.setLabel([
    MultiblockMachine.getMachineInfoLabel(stats, status),
    MultiblockMachine.getEnergyInfoLabel(machine),
  ]);
}
