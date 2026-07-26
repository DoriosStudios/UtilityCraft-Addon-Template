// @ts-check

import { ItemStack } from "@minecraft/server";
import { FluidStorage, Machine, registerIOInterface } from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";
import { advanceProcessCycle, getOutputCapacity } from "ExampleCore/index.js";

const BLOCK_ID = "utilitycraft:example_fluid_washer";
const INPUT_SLOT = 3;
// DoriosCore reserves slot 4 for the first liquid display during spawn.
const FLUID_DISPLAY_SLOT = 4;
const OUTPUT_SLOT = 5;
const FLUID_INDEX = 0;
const FLUID_PER_CRAFT = 250;
// Slot 4 renders the liquid tank, slot 5 is the item output, slots 6..8 hold
// upgrades, and each IO resource owns six face buttons after those controls.
const ITEM_IO_BUTTON_SLOTS = [9, 14];
const LIQUID_IO_BUTTON_SLOTS = [15, 20];

const RECIPES = Object.freeze({
  "minecraft:gravel": { output: "minecraft:flint", amount: 1, cost: 600 },
  "minecraft:sand": { output: "minecraft:clay_ball", amount: 2, cost: 800 },
});

registerIOInterface(BLOCK_ID, {
  items: {
    buttonSlots: ITEM_IO_BUTTON_SLOTS,
    anyInputSlots: [INPUT_SLOT],
    anyOutputSlots: [OUTPUT_SLOT],
    modes: [
      { id: "disabled" },
      { id: "input_1", inputSlots: [INPUT_SLOT] },
      { id: "output_1", outputSlots: [OUTPUT_SLOT] },
    ],
  },
  liquids: {
    buttonSlots: LIQUID_IO_BUTTON_SLOTS,
    anyInputIndices: [FLUID_INDEX],
    anyOutputIndices: [],
    modes: [
      { id: "disabled" },
      { id: "input_1", inputIndices: [FLUID_INDEX] },
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
    // The machine UI reads its progress bar from inventory slot 2.
    machine.displayProgress();

    const fluid = FluidStorage.initializeSingle(machine.entity);
    fluid.display(FLUID_DISPLAY_SLOT);
    const input = machine.container.getItem(INPUT_SLOT);
    const recipe = input ? RECIPES[input.typeId] : undefined;
    if (!input || !recipe) {
      machine.off();
      machine.showWarning(input ? "Invalid Recipe" : "No Input", { resetProgress: false });
      return;
    }
    if (fluid.type !== "example_coolant" || fluid.get() < FLUID_PER_CRAFT) {
      machine.off();
      machine.showWarning("Needs Example Coolant", { resetProgress: false });
      return;
    }

    const capacity = getOutputCapacity(machine.container, OUTPUT_SLOT, recipe.output);
    const maxCrafts = Math.min(
      input.amount,
      Math.floor(capacity / recipe.amount),
      Math.floor(fluid.get() / FLUID_PER_CRAFT),
    );
    if (maxCrafts <= 0) {
      machine.off();
      machine.showWarning("Output Full", { resetProgress: false });
      return;
    }

    const result = advanceProcessCycle(machine, {
      energyCost: recipe.cost,
      maxCrafts,
      onComplete(craftCount) {
        fluid.consume(craftCount * FLUID_PER_CRAFT);
        DoriosLib.entity.changeItemAmount(machine.entity, { slot: INPUT_SLOT, amount: -craftCount });
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
    machine.displayEnergy();
    machine.displayProgress();
    machine.setLabel([
      "§aFluid Washer Running",
      `§7Coolant: §f${FluidStorage.formatFluid(fluid.get())}`,
      `§7Type: §f${DoriosLib.text.formatIdentifier(fluid.type)}`,
    ]);
  },

  onPlayerBreak(event) {
    Machine.onDestroy(event);
  },
});
