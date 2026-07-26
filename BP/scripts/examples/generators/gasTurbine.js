// @ts-check

import { EnergyStorage, registerIOInterface } from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";
import { ExampleGasGenerator } from "ExampleCore/index.js";

const BLOCK_ID = "utilitycraft:example_gas_turbine";
const GAS_DISPLAY_SLOT = 2;
// The inclusive range 3..8 provides the six face buttons expected by DoriosCore.
const GAS_IO_BUTTON_SLOTS = [3, 8];

registerIOInterface(BLOCK_ID, {
  gases: {
    buttonSlots: GAS_IO_BUTTON_SLOTS,
    anyInputIndices: [0],
    anyOutputIndices: [],
    modes: [
      { id: "disabled" },
      { id: "fuel", inputIndices: [0] },
    ],
  },
});

DoriosLib.registry.blockComponent(BLOCK_ID, {
  beforeOnPlayerPlace(event, { params: settings }) {
    ExampleGasGenerator.spawnEntity(event, settings, (entity) => {
      new ExampleGasGenerator(event.block, { ...settings, ignoreTick: true }).gas.display(GAS_DISPLAY_SLOT);
    });
  },

  onTick({ block }, { params: settings }) {
    const generator = new ExampleGasGenerator(block, settings);
    if (!generator.valid) return;
    generator.processIO();
    generator.gas.display(GAS_DISPLAY_SLOT);
    generator.energy.transferToNetwork(generator.rate * 4);

    const problem = generator.getFuelProblem();
    if (problem) {
      generator.off();
      generator.displayEnergy();
      generator.setLabel(`§e${problem}`);
      return;
    }

    const produced = generator.burnGas();
    generator.on();
    generator.displayEnergy();
    generator.setLabel([
      "§aGas Turbine Running",
      `§7Hydrogen: §f${generator.gas.get().toFixed(0)} units`,
      `§7Produced: §f${EnergyStorage.formatEnergyToText(produced)}/t`,
    ]);
  },

  onPlayerBreak(event) {
    ExampleGasGenerator.onDestroy(event);
  },
});
