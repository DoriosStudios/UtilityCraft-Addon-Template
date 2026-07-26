// @ts-check

import { ItemStack } from "@minecraft/server";
import { Machine, registerIOInterface } from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";
import { advanceProcessCycle, getOutputCapacity } from "ExampleCore/index.js";

const BLOCK_ID = "utilitycraft:example_infuser";
const BASE_SLOT = 3;
const CATALYST_SLOT = 4;
const OUTPUT_SLOT = 5;
// Slots 6..8 hold upgrades. The inclusive range 9..14 reserves exactly six
// different slots for the item IO buttons rendered by DoriosCore.
const ITEM_IO_BUTTON_SLOTS = [9, 14];

const RECIPES = Object.freeze({
  "minecraft:redstone|minecraft:iron_ingot": {
    output: "utilitycraft:example_energized_alloy",
    catalystRequired: 2,
    baseRequired: 1,
    amount: 1,
    cost: 1_200,
  },
  "minecraft:glowstone_dust|minecraft:copper_ingot": {
    output: "utilitycraft:example_crystal_shard",
    catalystRequired: 1,
    baseRequired: 1,
    amount: 2,
    cost: 900,
  },
});

registerIOInterface(BLOCK_ID, {
  items: {
    buttonSlots: ITEM_IO_BUTTON_SLOTS,
    anyInputSlots: [BASE_SLOT, CATALYST_SLOT],
    anyOutputSlots: [OUTPUT_SLOT],
    modes: [
      { id: "disabled" },
      { id: "input_1", inputSlots: [BASE_SLOT] },
      { id: "input_2", inputSlots: [CATALYST_SLOT] },
      { id: "output_1", outputSlots: [OUTPUT_SLOT] },
    ],
  },
});

DoriosLib.registry.blockComponent(BLOCK_ID, {
  beforeOnPlayerPlace(event, { params: settings }) {
    Machine.spawnEntity(event, settings, () => {
      const machine = new Machine(event.block, { ...settings, ignoreTick: true });
      machine.setEnergyCost(settings.machine.energy_cost);
      machine.displayProgress();
    });
  },

  onTick({ block }, { params: settings }) {
    const machine = new Machine(block, settings);
    if (!machine.valid) return;
    machine.processIO();
    // Keep the slot-2 progress item synchronized even when a required input is
    // missing or the current process is waiting for energy.
    machine.displayProgress();

    const base = machine.container.getItem(BASE_SLOT);
    const catalyst = machine.container.getItem(CATALYST_SLOT);
    const recipe = base && catalyst ? RECIPES[`${catalyst.typeId}|${base.typeId}`] : undefined;
    if (!base || !catalyst || !recipe) {
      machine.off();
      machine.showWarning(!base ? "No Base" : !catalyst ? "No Catalyst" : "Invalid Recipe", {
        resetProgress: false,
      });
      return;
    }

    const capacity = getOutputCapacity(machine.container, OUTPUT_SLOT, recipe.output);
    const maxCrafts = Math.min(
      Math.floor(base.amount / recipe.baseRequired),
      Math.floor(catalyst.amount / recipe.catalystRequired),
      Math.floor(capacity / recipe.amount),
    );
    if (maxCrafts <= 0) {
      machine.off();
      machine.showWarning("Inputs Low or Output Full", { resetProgress: false });
      return;
    }

    const result = advanceProcessCycle(machine, {
      energyCost: recipe.cost,
      maxCrafts,
      onComplete(craftCount) {
        DoriosLib.entity.changeItemAmount(machine.entity, {
          slot: BASE_SLOT,
          amount: -craftCount * recipe.baseRequired,
        });
        DoriosLib.entity.changeItemAmount(machine.entity, {
          slot: CATALYST_SLOT,
          amount: -craftCount * recipe.catalystRequired,
        });
        const output = machine.container.getItem(OUTPUT_SLOT);
        if (output) {
          DoriosLib.entity.changeItemAmount(machine.entity, {
            slot: OUTPUT_SLOT,
            amount: craftCount * recipe.amount,
          });
        } else {
          machine.container.setItem(OUTPUT_SLOT, new ItemStack(recipe.output, craftCount * recipe.amount));
        }
      },
    });

    if (result.state === "no_energy") {
      machine.off();
      machine.showWarning("No Energy", { resetProgress: false });
      return;
    }
    machine.on();
    machine.displayProgress();
    machine.showStatus("Infusing");
  },

  onPlayerBreak(event) {
    Machine.onDestroy(event);
  },
});
