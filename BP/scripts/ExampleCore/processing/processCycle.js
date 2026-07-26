// @ts-check

/**
 * Advances one energy-backed machine process while honoring DoriosCore's
 * standard `energy_cost`, `energy_efficiency` and `process_batch` boosts.
 *
 * Recipe selection and output validation stay in each concrete machine. This
 * helper only centralizes the progress arithmetic so examples do not silently
 * consume inputs when an output is full.
 *
 * @param {import("DoriosCore/index.js").Machine} machine
 * @param {{
 *   energyCost: number,
 *   maxCrafts: number,
 *   onComplete: (craftCount: number) => void
 * }} options
 * @returns {{ state: "no_energy"|"processing"|"completed"|"blocked", craftCount: number }}
 */
export function advanceProcessCycle(machine, options) {
  const energyCost = Math.max(1, options.energyCost);
  const maxCrafts = Math.max(0, Math.floor(options.maxCrafts));
  if (maxCrafts <= 0) return { state: "blocked", craftCount: 0 };

  machine.setEnergyCost(energyCost);
  let progress = machine.getProgress();
  const processBatch = Math.max(1, Math.floor(machine.boosts.process_batch ?? 1));
  const consumption = Math.max(0.01, Number(machine.boosts.consumption ?? 1));

  // Only request enough progress for crafts that can actually fit.
  const requiredCycles = Math.ceil(maxCrafts / processBatch);
  const progressCapacity = Math.max(0, requiredCycles * energyCost - progress);
  const energyToConsume = Math.min(
    machine.energy.get(),
    machine.rate,
    progressCapacity * consumption,
  );

  if (energyToConsume > 0) {
    machine.energy.consume(energyToConsume);
    progress += energyToConsume / consumption;
    machine.setProgress(progress, { display: false });
  }

  const completedCycles = Math.floor(progress / energyCost);
  const craftCount = Math.min(maxCrafts, completedCycles * processBatch);
  if (craftCount > 0) {
    options.onComplete(craftCount);
    progress -= Math.ceil(craftCount / processBatch) * energyCost;
    machine.setProgress(progress, { display: false });
    return { state: "completed", craftCount };
  }

  if (machine.energy.get() <= 0 && energyToConsume <= 0) {
    return { state: "no_energy", craftCount: 0 };
  }
  return { state: "processing", craftCount: 0 };
}

/** Returns how many matching output items can fit in one inventory slot. */
export function getOutputCapacity(container, slot, outputTypeId) {
  const output = container.getItem(slot);
  if (!output) return 64;
  if (output.typeId !== outputTypeId) return 0;
  return Math.max(0, output.maxAmount - output.amount);
}

