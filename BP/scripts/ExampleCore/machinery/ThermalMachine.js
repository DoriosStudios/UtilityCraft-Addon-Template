// @ts-check

import { Machine } from "DoriosCore/index.js";

const HEAT_PROPERTY = "utilitycraft:example_heat";

/**
 * Addon-owned Machine extension used by the thermal crusher example.
 *
 * DoriosCore remains unchanged. This class adds a heat subsystem by storing a
 * number on the helper entity and by reading custom perks from `this.boosts`.
 * The regular Machine constructor still provides energy, progress, upgrades,
 * inventory access, scheduling, UI helpers and IO processing.
 */
export class ThermalMachine extends Machine {
  /**
   * @param {import("@minecraft/server").Block} block
   * @param {import("DoriosCore/index.js").MachineSettings & {
   *   thermal?: { maxHeat?: number, heatPerCraft?: number, passiveCooling?: number }
   * }} settings
   */
  constructor(block, settings) {
    super(block, settings);
    if (!this.valid) return;

    const thermal = settings.thermal ?? {};
    this.baseMaxHeat = Math.max(1, thermal.maxHeat ?? 100);
    this.heatPerCraft = Math.max(0, thermal.heatPerCraft ?? 8);
    this.passiveCooling = Math.max(0, thermal.passiveCooling ?? 1);
  }

  /** Returns the current stored heat. */
  getHeat() {
    return Number(this.entity.getDynamicProperty(HEAT_PROPERTY) ?? 0);
  }

  /**
   * Returns the effective heat limit. The `max_heat` perk is registered by the
   * template's thermal upgrade and is intentionally interpreted here, not in
   * DoriosCore.
   */
  getMaxHeat() {
    return this.baseMaxHeat + Number(this.boosts.max_heat ?? 0);
  }

  /** Adds heat while clamping the value to the effective machine limit. */
  addHeat(amount = this.heatPerCraft) {
    const next = Math.min(this.getMaxHeat(), this.getHeat() + Math.max(0, amount));
    this.entity.setDynamicProperty(HEAT_PROPERTY, next);
    return next;
  }

  /**
   * Cools the machine. The custom `cooling_rate` perk is additive and can be
   * supplied by any registered addon upgrade that uses the thermal type.
   */
  coolDown(multiplier = 1) {
    const cooling = this.passiveCooling + Number(this.boosts.cooling_rate ?? 0);
    const next = Math.max(0, this.getHeat() - cooling * Math.max(0, multiplier));
    this.entity.setDynamicProperty(HEAT_PROPERTY, next);
    return next;
  }

  /** True when another craft would reach or exceed the heat limit. */
  wouldOverheat(craftCount = 1) {
    return this.getHeat() + this.heatPerCraft * Math.max(1, craftCount) >= this.getMaxHeat();
  }

  /** A compact percentage useful for UI labels. */
  getHeatPercent() {
    return Math.min(100, (this.getHeat() / this.getMaxHeat()) * 100);
  }
}

