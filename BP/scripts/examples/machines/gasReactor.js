// @ts-check

import { ItemStack } from "@minecraft/server";
import { GasStorage, Machine, registerIOInterface } from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";
import { advanceProcessCycle, getOutputCapacity } from "ExampleCore/index.js";

const BLOCK_ID = "utilitycraft:example_gas_reactor";
const INPUT_SLOT = 3;
const OUTPUT_SLOT = 4;
const HYDROGEN_INDEX = 0;
const EXHAUST_INDEX = 1;
const HYDROGEN_DISPLAY_SLOT = 5;
const EXHAUST_DISPLAY_SLOT = 6;
const HYDROGEN_PER_CRAFT = 250;
const EXHAUST_PER_CRAFT = 100;
// Slots 5 and 6 render both gas tanks, slots 7..9 hold upgrades, and the
// remaining ranges reserve six unique face buttons for each IO resource.
const ITEM_IO_BUTTON_SLOTS = [10, 15];
const GAS_IO_BUTTON_SLOTS = [16, 21];

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
  gases: {
    buttonSlots: GAS_IO_BUTTON_SLOTS,
    anyInputIndices: [HYDROGEN_INDEX],
    anyOutputIndices: [EXHAUST_INDEX],
    modes: [
      { id: "disabled" },
      { id: "input_1", inputIndices: [HYDROGEN_INDEX] },
      { id: "output_1", outputIndices: [EXHAUST_INDEX] },
    ],
  },
});

DoriosLib.registry.blockComponent(BLOCK_ID, {
  beforeOnPlayerPlace(event, { params: settings }) {
    Machine.spawnEntity(event, settings, (entity) => {
      const tanks = GasStorage.initializeMultiple(entity, 2);
      tanks[0]?.setType("example_hydrogen");
      tanks[1]?.setType("example_exhaust");
      tanks[0]?.display(HYDROGEN_DISPLAY_SLOT);
      tanks[1]?.display(EXHAUST_DISPLAY_SLOT);
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

    const [hydrogen, exhaust] = GasStorage.initializeMultiple(machine.entity, 2);
    if (!hydrogen || !exhaust) return;
    if (hydrogen.type === "empty") hydrogen.setType("example_hydrogen");
    if (exhaust.type === "empty") exhaust.setType("example_exhaust");
    hydrogen.display(HYDROGEN_DISPLAY_SLOT);
    exhaust.display(EXHAUST_DISPLAY_SLOT);

    const catalyst = machine.container.getItem(INPUT_SLOT);
    if (!catalyst || catalyst.typeId !== "minecraft:iron_ingot") {
      machine.off();
      machine.showWarning("Needs Iron Catalyst", { resetProgress: false });
      return;
    }
    if (hydrogen.type !== "example_hydrogen" || hydrogen.get() < HYDROGEN_PER_CRAFT) {
      machine.off();
      machine.showWarning("Needs Hydrogen", { resetProgress: false });
      return;
    }

    const outputCapacity = getOutputCapacity(
      machine.container,
      OUTPUT_SLOT,
      "utilitycraft:example_crystal_shard",
    );
    const maxCrafts = Math.min(
      catalyst.amount,
      outputCapacity,
      Math.floor(hydrogen.get() / HYDROGEN_PER_CRAFT),
      Math.floor(exhaust.getFreeSpace() / EXHAUST_PER_CRAFT),
    );
    if (maxCrafts <= 0) {
      machine.off();
      machine.showWarning("Output or Exhaust Full", { resetProgress: false });
      return;
    }

    const result = advanceProcessCycle(machine, {
      energyCost: 1_400,
      maxCrafts,
      onComplete(craftCount) {
        hydrogen.consume(craftCount * HYDROGEN_PER_CRAFT);
        exhaust.add(craftCount * EXHAUST_PER_CRAFT);
        DoriosLib.entity.changeItemAmount(machine.entity, { slot: INPUT_SLOT, amount: -craftCount });
        const output = machine.container.getItem(OUTPUT_SLOT);
        if (output) {
          DoriosLib.entity.changeItemAmount(machine.entity, { slot: OUTPUT_SLOT, amount: craftCount });
        } else {
          machine.container.setItem(
            OUTPUT_SLOT,
            new ItemStack("utilitycraft:example_crystal_shard", craftCount),
          );
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
      "§aGas Reactor Running",
      `§7Hydrogen: §f${GasStorage.formatGas(hydrogen.get())}`,
      `§7Exhaust: §f${GasStorage.formatGas(exhaust.get())}`,
    ]);
  },

  onPlayerBreak(event) {
    Machine.onDestroy(event);
  },
});
