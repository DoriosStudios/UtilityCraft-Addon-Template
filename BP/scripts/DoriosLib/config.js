// @ts-check

/**
 * Metadata announced by this DoriosLib installation to other addons in the
 * world through `dorios:dependency_checker`.
 *
 * Add dependency requirements to `dependencies` when UtilityCraft starts
 * depending on another Dorios addon.
 *
 * @type {import("./dependencies/index.js").AddonMetadata}
 */
export const ADDON_METADATA = {
  name: "UtilityCraft Addon Template",
  author: "Dorios Studios",
  identifier: "utilitycraft_addon_template",
  version: "0.1.0",
  dependencies: {
    utilitycraft: {
      name: "UtilityCraft",
      version: "3.5.0",
      warning: "UtilityCraft Addon Template requires UtilityCraft 3.5.0 or newer.",
    },
  },
};

/** @type {import("./dependencies/index.js").InitializeOptions} */
export const DEPENDENCY_OPTIONS = {
  validationDelayTicks: 300,
  announceSuccess: true,
};
