// @ts-check

import { ItemStack } from "@minecraft/server";
import { registerIOInterface } from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";
import { advanceProcessCycle, getOutputCapacity, ThermalMachine } from "ExampleCore/index.js";

const BLOCK_ID = "utilitycraft:example_thermal_crusher";
const INPUT_SLOT = 3;
const OUTPUT_SLOT = 4;
// A two-number buttonSlots value is an inclusive range. DoriosCore needs one
// dedicated button for each of the six machine faces, so 9..14 is six slots.
const ITEM_IO_BUTTON_SLOTS = [9, 14];

/** Processing recipes demonstrated by the Thermal Crusher. */
const RECIPES = Object.freeze({
  "minecraft:cobblestone": { output: "minecraft:gravel", amount: 1, cost: 800 },
  "minecraft:gravel": { output: "minecraft:sand", amount: 1, cost: 1_000 },
  "utilitycraft:example_crystal_shard": { output: "minecraft:amethyst_shard", amount: 2, cost: 1_200 },
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
});

DoriosLib.registry.blockComponent(BLOCK_ID, {
  beforeOnPlayerPlace(event, { params: settings }) {
    ThermalMachine.spawnEntity(event, settings, () => {
      const machine = new ThermalMachine(event.block, { ...settings, ignoreTick: true });
      machine.setEnergyCost(settings.machine.energy_cost);
      machine.displayProgress();
    });
  },

  onTick({ block }, { params: settings }) {
    const machine = new ThermalMachine(block, settings);
    if (!machine.valid) return;

    machine.processIO();
    // Slot 2 is rendered by `uc.progress_display`. Refreshing it before the
    // validation branches keeps the bar visible while processing is paused.
    machine.displayProgress();
    machine.coolDown(0.25);

    const input = machine.container.getItem(INPUT_SLOT);
    const recipe = input ? RECIPES[input.typeId] : undefined;
    if (!input || !recipe) {
      machine.off();
      machine.coolDown(1);
      machine.showWarning(input ? "Invalid Recipe" : "No Input", { resetProgress: false });
      return;
    }

    if (machine.wouldOverheat()) {
      machine.off();
      machine.coolDown(2);
      machine.showWarning("Cooling Down", { resetProgress: false });
      return;
    }

    const outputCapacity = getOutputCapacity(machine.container, OUTPUT_SLOT, recipe.output);
    const maxCrafts = Math.min(input.amount, Math.floor(outputCapacity / recipe.amount));
    if (maxCrafts <= 0) {
      machine.off();
      machine.showWarning("Output Full", { resetProgress: false });
      return;
    }

    const result = advanceProcessCycle(machine, {
      energyCost: recipe.cost,
      maxCrafts,
      onComplete(craftCount) {
        DoriosLib.entity.changeItemAmount(machine.entity, {
          slot: INPUT_SLOT,
          amount: -craftCount,
        });

        const current = machine.container.getItem(OUTPUT_SLOT);
        if (current) {
          DoriosLib.entity.changeItemAmount(machine.entity, {
            slot: OUTPUT_SLOT,
            amount: craftCount * recipe.amount,
          });
        } else {
          machine.container.setItem(
            OUTPUT_SLOT,
            new ItemStack(recipe.output, craftCount * recipe.amount),
          );
        }
        machine.addHeat(craftCount * machine.heatPerCraft);
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
      "§aThermal Crusher Running",
      `§7Heat: §f${machine.getHeat().toFixed(1)} / ${machine.getMaxHeat().toFixed(1)}`,
      `§7Heat load: §f${machine.getHeatPercent().toFixed(0)}%`,
      `§7Batch: §fx${Math.max(1, Math.floor(machine.boosts.process_batch))}`,
    ]);
  },

  onPlayerBreak(event) {
    ThermalMachine.onDestroy(event);
  },
});
