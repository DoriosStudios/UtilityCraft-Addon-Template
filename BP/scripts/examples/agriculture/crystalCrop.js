// @ts-check

import { ItemStack } from "@minecraft/server";
import * as DoriosLib from "DoriosLib/index.js";

const AGE_STATE = "utilitycraft:example_age";
const MAX_AGE = 5;

function harvest(block) {
  const amount = DoriosLib.math.randomInt(2, 4);
  block.dimension.spawnItem(new ItemStack("utilitycraft:example_crystal_shard", amount), block.center());
  if (Math.random() < 0.15) {
    block.dimension.spawnItem(new ItemStack("utilitycraft:example_crystal_seeds", 1), block.center());
  }
  DoriosLib.block.setState(block, AGE_STATE, 0);
}

/**
 * Template-owned crop behavior. The crop is also registered through
 * DoriosLib.registry.registerPlant so UtilityCraft machinery and Bonsai can
 * recognize the same seed without requiring access to UtilityCraft internals.
 */
DoriosLib.registry.blockComponent("utilitycraft:example_crystal_crop", {
  onTick({ block }) {
    const age = Number(DoriosLib.block.getState(block, AGE_STATE) ?? 0);
    if (age < MAX_AGE) DoriosLib.block.setState(block, AGE_STATE, age + 1);
  },

  onPlayerInteract({ block }) {
    if (DoriosLib.block.getState(block, AGE_STATE) === MAX_AGE) harvest(block);
  },

  onPlayerBreak({ block, brokenBlockPermutation }) {
    if (brokenBlockPermutation.getState(AGE_STATE) !== MAX_AGE) return;
    block.dimension.spawnItem(
      new ItemStack("utilitycraft:example_crystal_shard", DoriosLib.math.randomInt(1, 2)),
      block.center(),
    );
  },
});

