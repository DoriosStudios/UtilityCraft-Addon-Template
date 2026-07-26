// @ts-check

import { world } from "@minecraft/server";
import { EnergyStorage, Generator } from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";

const BLOCK_ID = "utilitycraft:example_solar_generator";

DoriosLib.registry.blockComponent(BLOCK_ID, {
  beforeOnPlayerPlace(event, { params: settings }) {
    Generator.spawnEntity(event, settings);
  },

  onTick({ block }, { params: settings }) {
    const generator = new Generator(block, settings);
    if (!generator.valid) return;

    // Network topology is owned by UtilityCore; Generator only requests a
    // transfer through DoriosCore's public EnergyStorage contract.
    generator.energy.transferToNetwork(generator.rate * 4);

    const time = world.getTimeOfDay();
    const daylight = time < 12_000;
    const skyOpen = block.above(1)?.typeId === "minecraft:air";
    if (!daylight || !skyOpen || generator.energy.getFreeSpace() <= 0) {
      generator.off();
      generator.displayEnergy();
      generator.setLabel(daylight ? "§eNeeds Open Sky" : "§eWaiting for Daylight");
      return;
    }

    const produced = Math.min(generator.rate, generator.energy.getFreeSpace());
    generator.energy.add(produced);
    generator.on();
    generator.displayEnergy();
    generator.setLabel([
      "§aSolar Generator Running",
      `§7Produced: §f${EnergyStorage.formatEnergyToText(produced)}/t`,
    ]);
  },

  onPlayerBreak(event) {
    Generator.onDestroy(event);
  },
});

