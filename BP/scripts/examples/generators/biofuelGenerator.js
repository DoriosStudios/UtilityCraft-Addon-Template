// @ts-check

import { EnergyStorage, FluidStorage, Generator, registerIOInterface } from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";

const BLOCK_ID = "utilitycraft:example_biofuel_generator";
const ENERGY_PER_FLUID = 30;
const FLUID_DISPLAY_SLOT = 2;
// The inclusive range 3..8 provides the six face buttons expected by DoriosCore.
const LIQUID_IO_BUTTON_SLOTS = [3, 8];

registerIOInterface(BLOCK_ID, {
  liquids: {
    buttonSlots: LIQUID_IO_BUTTON_SLOTS,
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
    Generator.spawnEntity(event, settings, (entity) => {
      FluidStorage.initializeSingle(entity).display(FLUID_DISPLAY_SLOT);
    });
  },

  onTick({ block }, { params: settings }) {
    const generator = new Generator(block, settings);
    if (!generator.valid) return;
    generator.processIO();
    generator.energy.transferToNetwork(generator.rate * 4);

    const fuel = FluidStorage.initializeSingle(generator.entity);
    fuel.display(FLUID_DISPLAY_SLOT);
    if (fuel.type !== "example_biofuel" || fuel.get() <= 0) {
      generator.off();
      generator.displayEnergy();
      generator.setLabel("§eNeeds Example Biofuel");
      return;
    }
    if (generator.energy.getFreeSpace() <= 0) {
      generator.off();
      generator.displayEnergy();
      generator.setLabel("§eEnergy Full");
      return;
    }

    const produced = Math.min(
      generator.rate,
      generator.energy.getFreeSpace(),
      fuel.get() * ENERGY_PER_FLUID,
    );
    fuel.consume(produced / ENERGY_PER_FLUID);
    generator.energy.add(produced);
    generator.on();
    generator.displayEnergy();
    generator.setLabel([
      "§aBiofuel Generator Running",
      `§7Fuel: §f${FluidStorage.formatFluid(fuel.get())}`,
      `§7Produced: §f${EnergyStorage.formatEnergyToText(produced)}/t`,
    ]);
  },

  onPlayerBreak(event) {
    Generator.onDestroy(event);
  },
});
