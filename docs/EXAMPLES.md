# Example catalog

Every script is commented in English and keeps its processing data next to the behavior that consumes it.

## Creative inventory catalog

`BP/item_catalog/crafting_item_catalog.json` organizes every player-facing
example into the same four creative categories used by UtilityCraft. The
`category_name` containing an identifier must exactly match that block or
item's `description.menu_category.category`; otherwise Bedrock may omit it
from the intended group. Internal display items keep `category: "none"` and
must not be added to this catalog.

Each custom group name has a matching localization entry in `en_US.lang`.
When adding a player-facing block or item, add it to one catalog group and run
`npm run verify:catalog`. The verifier catches missing definitions, duplicate
entries, category mismatches, invalid icons and missing group translations.

Custom liquids and gases require a complete display sequence. For a resource
named `example_hydrogen`, DoriosCore renders items
`utilitycraft:example_hydrogen_00` through
`utilitycraft:example_hydrogen_48`. Each item must exist in the BP, reference a
matching `item_texture.json` entry, and have its PNG in the RP. Run
`npm run verify:resources` before exporting the template to detect an incomplete
sequence.

To scaffold another resource from an existing 49-frame bar while preserving
its transparency and shading, run:

```powershell
powershell -ExecutionPolicy Bypass -File tools/generate-resource.ps1 `
  -ResourceId example_oxygen `
  -Kind gas `
  -SourceTextureDirectory RP/textures/ui/example_hydrogen_bar `
  -SourcePrefix example_hydrogen `
  -Tint 8FEAFF
```

The generator creates the 49 BP items, the 49 tinted RP textures, their
`item_texture.json` entries, the physical tank entity in the BP, its client
entity in the RP and its 16x16 texture. Fluid entities reuse
`geometry.utilitycraft_fluid_tank_entity`; gas entities reuse
`geometry.utilitycraft_gas_tank_entity`, both supplied by UtilityCraft.
It also creates a Creative Tank block using `utilitycraft:infinite_tank` and the
matching shared creative-tank geometry.
Register the resulting type in `resources.js`; `verify:resources` discovers
registered fluid and gas types from that file automatically.

### Creative resource tanks

The template includes infinite tanks for coolant, biofuel, hydrogen and
exhaust. They use UtilityCore's shared `utilitycraft:infinite_tank` custom
component; no addon script is needed. Each block declares `resource` as
`fluid` or `gas` and passes the exact registered `type`.

Creative fluid blocks reuse `geometry.utilitycraft_creative_fluid_tank` and
creative gas blocks reuse `geometry.utilitycraft_creative_gas_tank`. Their
default material uses the matching UtilityCraft tank texture copied into the
template, while the `fluid` or `gas` material points to the resource's entity
texture through `terrain_texture.json`.

## Utility blocks

### Cobblestone Generator

`example_cobble_generator` uses UtilityCraft's public `utilitycraft:block_generator` component to produce one cobblestone every 10 ticks. The shared component first tries the inventory on its output face and stores the remainder in the standard `utilitycraft:e0` and `utilitycraft:e1` buffer states. Interacting with an empty hand retrieves that buffer.

### Deepslate Generator

`example_deepslate_generator` uses the same component with `material: "minecraft:deepslate"` and `amount: 3`. This demonstrates that addon block generators only need a unique block definition, the shared states and different component parameters—no addon-owned generator script.

## Machines

### Thermal Crusher

- Input slot: one scripted material.
- Output slot: the recipe result.
- Energy: required.
- Upgrades: speed, efficiency, batch, and custom thermal.
- Addon extension: `ThermalMachine` adds persistent heat, cooling, maximum heat, and thermal upgrade perks.

### Infuser

- Inputs: catalyst and base item.
- Output: energized result.
- Recipes: normal two-item combinations with required amounts, output amounts and energy costs.
- Registry example: separate normal two-item recipes extend UtilityCraft's official Infuser.

### Liquid Washer

- Item input and output.
- One liquid tank restricted by behavior to `example_coolant`.
- Consumes coolant per completed operation.
- Demonstrates item and liquid IO declarations on one machine.

### Gas Reactor

- Consumes an item plus `example_hydrogen`.
- Produces an item plus `example_exhaust`.
- Uses two gas tanks so input and output can be independently routed.

## Generators

### Solar Generator

A passive generator. It checks daylight and sky visibility, stores energy, and transfers available energy through UtilityCraft's energy/network integration.

### Biofuel Generator

An active liquid generator. It accepts `example_biofuel`, converts millibuckets into Dorios Energy, and transfers stored energy.

### Gas Turbine

An active gas generator backed by `ExampleGasGenerator`. The subclass owns its gas storage and conversion method, while DoriosCore still provides generator lifecycle, energy storage, IO, display, and transfer behavior.

## Registrations

`BP/scripts/config` demonstrates these public DoriosLib registrations:

- machine upgrades;
- fluid items and empty fluid holders;
- gas items and empty gas holders;
- coolant values;
- Crusher/Hammer recipes;
- normal two-item Infuser recipes;
- Electro Press recipes, including one optional `{wood}` placeholder template;
- Magmatic Chamber recipes registered through the Melter registry;
- a UtilityCraft Furnace recycling recipe;
- Sieve and Autofisher drops;
- Furnator fuels;
- plants and Bonsai definitions;

The ordinary crafting-table recipes under `BP/recipes` use format version
`1.20.80`, matching current UtilityCraft recipes. Every 1.20+ recipe must also
declare a non-empty `unlock` list; the examples use their own ingredients as
unlock conditions.

### Official machine recipe parameters

The registration examples live in `BP/scripts/config/recipes`.

| Registry | Key | Supported example fields |
| --- | --- | --- |
| Infuser | `catalystId|baseItemId` | `output`, `required`, `input_required`, `amount`, `cost` |
| Electro Press | input item ID | `output`, `required`, `amount`, `cost` |
| Magmatic Chamber/Melter | input item ID | `liquid`, `amount`, `cost` |
| Furnace | input item ID | `output`, `required`, `amount`, `cost` |
| Crusher/Hammer | input item ID | `output`, `required`, `amount`, `tier`, `cost` |

The `{wood}` Electro Press template is expanded locally into oak, birch and spruce recipes. Only the resulting concrete identifiers are dispatched to UtilityCraft.

The standard upgrade perks used here are:

| Perk | Meaning |
| --- | --- |
| `speed` | Raises the machine processing rate. |
| `energy_cost` | Adds the energy penalty associated with faster or larger processing. |
| `energy_efficiency` | Reduces effective energy consumption. |
| `process_batch` | Adds operations to a completed processing batch. |

`max_heat` and `cooling_rate` are addon-owned perks read only by `ThermalMachine`. DoriosCore does not need to know about them.

## Tools and agriculture

- `example_hammer` uses the shared Hammer item component and its custom Crusher/Hammer recipe.
- `example_mesh` registers a valid mesh tier for UtilityCraft automation and Sieve drops.
- `example_fishing_net` uses the shared Fishing Net component and registered fishing loot.
- `example_crystal_seeds` places a fully addon-owned crop component.
- The same seed is registered as a plant so UtilityCraft machinery and Bonsai can consume its definition.

UtilityCraft's manual Sieve currently accepts only its official mesh catalog. The custom mesh is therefore demonstrated through public registry/automation integration; do not patch the Sieve's private catalog from an addon.
