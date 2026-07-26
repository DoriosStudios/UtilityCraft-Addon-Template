// @ts-check

import {
  EnergyStorage,
  FluidStorage,
  Multiblock,
  MultiblockGenerator,
  registerLinkNodeIO,
} from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";

const BLOCK_ID = "utilitycraft:example_biofuel_dynamo";
const ENERGY_PER_MB = 45;

const CONFIG = {
  required_case: "dorios:multiblock.case.example",
  entity: {
    identifier: "utilitycraft:example_multiblock_machine",
    type: "fluid_generator",
    name: "example_biofuel_dynamo",
    // Slot 4 is DoriosCore's canonical first-liquid display slot.
    inventory_size: 5,
    fixed_fluid_types: true,
  },
  generator: {
    energy_cap: 1,
    fluid_cap: 64_000,
    fluid_types: 1,
    rate_speed_base: 400,
  },
  requirements: {
    example_energy_cell: {
      amount: 1,
      warning: "\u00A7c[Biofuel Dynamo] Add at least one Example Energy Cell inside.",
    },
    example_fluid_cell: {
      amount: 1,
      warning: "\u00A7c[Biofuel Dynamo] Add at least one Example Fluid Cell inside.",
    },
  },
};

registerLinkNodeIO(BLOCK_ID, {
  liquids: {
    anyInputIndices: [0],
    anyOutputIndices: [],
    inputs: [{ id: "fuel", label: "Biofuel Input", color: "\u00A7a", indices: [0] }],
    outputs: [],
  },
});

DoriosLib.registry.blockComponent(BLOCK_ID, {
  onPlayerInteract(event) {
    return MultiblockGenerator.handlePlayerInteract(event, CONFIG, {
      onActivate({ entity, components }) {
        const energyCapacity = (components.example_energy_cell ?? 0) * 4_000_000;
        const fluidCapacity = (components.example_fluid_cell ?? 0) * 128_000;

        EnergyStorage.setCap(entity, energyCapacity);
        entity.setDynamicProperty("dorios:energyCap", energyCapacity);

        const fuel = FluidStorage.initializeSingle(entity);
        fuel.setType("example_biofuel");
        fuel.setCap(fluidCapacity);

        // A larger multiblock can transfer more energy each tick.
        entity.setDynamicProperty("dorios:rateSpeed", Math.max(400, energyCapacity / 5_000));
      },
      successMessages({ components }) {
        return [
          "\u00A7a[Biofuel Dynamo] Structure activated.",
          `\u00A77Energy cells: \u00A7f${components.example_energy_cell ?? 0}`,
          `\u00A77Fluid cells: \u00A7f${components.example_fluid_cell ?? 0}`,
        ];
      },
    });
  },

  onPlayerBreak({ block, player }) {
    Multiblock.DeactivationManager.handleBreakController(block, player);
  },

  onTick({ block }) {
    const generator = new MultiblockGenerator(block, CONFIG);
    if (!generator.valid) return;

    generator.processIO();
    generator.setRate(Number(generator.entity.getDynamicProperty("dorios:rateSpeed")) || 400);
    generator.energy.transferToNetwork(generator.rate);

    const fuel = FluidStorage.initializeSingle(generator.entity);
    if (fuel.type !== "example_biofuel" || fuel.get() <= 0) {
      generator.off();
      updateLabel(generator, fuel, 0, "\u00A7eNeeds Example Biofuel");
      return;
    }

    const produced = Math.min(
      generator.rate,
      generator.energy.getFreeSpace(),
      fuel.get() * ENERGY_PER_MB,
    );
    if (produced <= 0) {
      generator.off();
      updateLabel(generator, fuel, 0, "\u00A7eEnergy Full");
      return;
    }

    fuel.consume(produced / ENERGY_PER_MB);
    generator.energy.add(produced);
    generator.on();
    updateLabel(generator, fuel, produced, "\u00A7aRunning");
  },
});

function updateLabel(generator, fuel, produced, status) {
  generator.displayEnergy();
  fuel.display(4);
  generator.setLabel([
    `\u00A77Status: ${status}`,
    `\u00A7bStored: \u00A7f${EnergyStorage.formatEnergyToText(generator.energy.get())}`,
    `\u00A7aBiofuel: \u00A7f${FluidStorage.formatFluid(fuel.get())}`,
    `\u00A7eGenerated: \u00A7f${EnergyStorage.formatEnergyToText(produced)}/t`,
  ]);
}
