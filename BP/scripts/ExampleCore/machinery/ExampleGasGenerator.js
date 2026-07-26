// @ts-check

import { GasStorage, Generator } from "DoriosCore/index.js";

/**
 * Generator extension that owns one gas tank and converts gas into energy.
 *
 * The class demonstrates a useful addon-level specialization: Generator still
 * owns placement, energy storage, IO and network transfer, while this class
 * owns the meaning and energy value of its gas fuel.
 */
export class ExampleGasGenerator extends Generator {
  /**
   * @param {import("@minecraft/server").Block} block
   * @param {import("DoriosCore/index.js").GeneratorSettings & {
   *   fuelGas?: string,
   *   energyPerGasUnit?: number
   * }} settings
   */
  constructor(block, settings) {
    super(block, settings);
    if (!this.valid) return;

    this.gas = GasStorage.initializeSingle(this.entity);
    this.fuelGas = settings.fuelGas ?? "example_hydrogen";
    this.energyPerGasUnit = Math.max(1, settings.energyPerGasUnit ?? 40);
    if (this.gas.type === "empty") this.gas.setType(this.fuelGas);
  }

  /** Returns why fuel cannot currently be burned, or `undefined` when ready. */
  getFuelProblem() {
    if (this.gas.type === "empty" || this.gas.get() <= 0) return "No Gas";
    if (this.gas.type !== this.fuelGas) return "Invalid Gas";
    if (this.energy.getFreeSpace() <= 0) return "Energy Full";
    return undefined;
  }

  /**
   * Burns at most one generator-rate worth of gas and returns energy produced.
   */
  burnGas() {
    if (this.getFuelProblem()) return 0;

    const produced = Math.min(
      this.rate,
      this.energy.getFreeSpace(),
      this.gas.get() * this.energyPerGasUnit,
    );
    if (produced <= 0) return 0;

    this.gas.consume(produced / this.energyPerGasUnit);
    this.energy.add(produced);
    return produced;
  }
}
