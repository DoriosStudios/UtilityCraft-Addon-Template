# UtilityCraft Addon Template

A functional, commented Regolith project for learning how to extend UtilityCraft through the public DoriosCore and DoriosLib libraries.

This repository is intentionally broader than a machine demo. It includes scripted processing, upgrades, energy, liquids, gases, item integrations, crops, Bonsai support, custom tools, lightweight utility blocks, multiblocks, link-node ports, textures, recipes, and a repeatable build.

## Requirements

- Minecraft Bedrock compatible with the manifest versions in this project.
- UtilityCraft `3.5.0` or newer enabled in the same world.
- Node.js and npm for type checking and script bundling.
- Regolith `1.8.0` for development or release exports.

UtilityCraft provides the gameplay runtime used by these examples. DoriosLib is the global Dorios library; DoriosCore is the machinery-focused library. Network ownership remains in UtilityCore, not DoriosCore.

## The most important rule

Treat `BP/scripts/DoriosCore` and `BP/scripts/DoriosLib` as read-only dependency snapshots. Do not add addon behavior to those folders and do not import private subpaths.

Always import DoriosCore from its public root:

```js
import { Machine } from "DoriosCore/index.js";
```

Reusable addon behavior belongs in `BP/scripts/ExampleCore`. Rename that folder and alias to `ADDONNAME_CORE` when starting a real project. Concrete blocks and registrations belong in `BP/scripts/examples` and `BP/scripts/config`.

Run `npm run verify:imports` to enforce this boundary automatically.

## Start here

```powershell
npm install
npm run check
npm run verify:imports
regolith run buildDev
regolith run build
```

- `buildDev` exports readable source packs to `build/`.
- `build` bundles the runtime into one script and exports production-shaped packs to `build/`.
- `npm run bundle` creates a standalone bundle at `dist/scripts/main.js` for a quick script-only check.

In a test world, run:

```mcfunction
/function example/kit
```

This gives every example block, item, upgrade, resource container, and multiblock component.

## Recommended learning order

1. Read `BP/scripts/main.js` to see load order and registry installation.
2. Read `BP/scripts/config/recipes` for official UtilityCraft machine registrations, then the other config files for upgrades, fluids, gases, fuels, loot, plants, and Bonsai.
3. Read `BP/scripts/examples/machines/thermalCrusher.js` for a direct scripted recipe and standard upgrade perks.
4. Compare the Infuser, Liquid Washer, and Gas Reactor to see two-input, liquid, and gas processing.
5. Compare the passive Solar Generator with the active Biofuel Generator and Gas Turbine.
6. Read `BP/scripts/ExampleCore` to learn how addon-owned classes extend DoriosCore without modifying it.
7. Finish with `BP/scripts/examples/multiblocks` and [the multiblock guide](docs/MULTIBLOCKS.md).

## Included systems

| Area | Examples |
| --- | --- |
| Scripted machines | Thermal Crusher, Infuser, Liquid Washer, Gas Reactor |
| Generators | passive Solar, liquid Biofuel, gas Turbine |
| Utility blocks | buffered Cobblestone and Deepslate Generators using UtilityCraft's shared component |
| Resources | `example_coolant`, `example_biofuel`, `example_hydrogen`, `example_exhaust` |
| Upgrades | speed/energy cost, energy efficiency, process batch, addon thermal perks |
| UtilityCraft integrations | Crusher/Hammer, Infuser, Electro Press, Furnace, Magmatic Chamber, Autosieve, Autofisher and Furnator fuel |
| Agriculture | custom seed/crop and a registered Bonsai entity |
| Component-driven items | Hammer, Mesh, Fishing Net, liquid and gas capsules |
| Multiblocks | item-processing Factory Crusher and liquid Biofuel Dynamo with components and ports |

See [EXAMPLES.md](docs/EXAMPLES.md) for the purpose and inputs of every example.
See [UI.md](docs/UI.md) for the standard screen layout, slot map rules, tabs and canonical outline colors.

## Turning this into an addon

1. Replace the pack names, UUIDs, and description.
2. Keep the `utilitycraft` namespace only when that is the intended UtilityCraft extension policy; otherwise use your addon namespace for owned content.
3. Rename `ExampleCore` to a clear addon-owned name such as `MYADDON_CORE` and update aliases in `config.json`, `jsconfig.json`, and the bundle scripts.
4. Delete examples you do not need.
5. Replace copied teaching textures with final licensed assets.
6. Keep the UtilityCraft dependency and the public-root import verification.

The files copied from UtilityCraft and Heavy Machinery are used as learning assets in this Dorios Studios workspace. Review asset licensing before distributing a derived public template.
