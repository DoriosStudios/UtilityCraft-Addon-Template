# Machinery UI contract

The screens in `RP/ui/example_machinery.json` deliberately reuse UtilityCraft's public `uc` controls. The template does not copy or fork UtilityCraft's UI core.

Every screen uses the standard `162 x 72` machine area and keeps status text in `uc.machine_small_screen` or `uc.big_machine_screen`. No side panel is used because the examples fit in the normal area.

## Shared tabs

- `uc.upgrades_tab` points at the exact upgrade slots declared by `utilitycraft:machine_upgrades`.
- `uc.io_tab` points at the six button slots registered by `registerIOInterface`, in `top`, `left`, `front`, `right`, `bottom`, `back` order.
- `uc.info_tab` uses an `ui.utilitycraft:info.*` language entry instead of embedding documentation in the UI JSON.

Generators only show tabs supported by their runtime contract. Solar has Info only; liquid and gas generators have IO and Info. DoriosCore's base `Generator` does not resolve machine upgrades, so the template does not display upgrade slots that would have no effect.

Multiblock controller screens show their normal runtime storage and Info. Their modules and ports are physical multiblock components, not controller inventory slots, so their configuration is documented in Info rather than represented as false internal tabs.

## Processing progress

Every machine that completes work over time reserves inventory slot `2` for DoriosCore's progress item. Its top panel renders that same slot with `uc.progress_display`:

```json
{
  "progress@uc.progress_display": {
    "collection_index": 2
  }
}
```

The runtime calls `machine.displayProgress()` while the screen is open, including paused and blocked states. DoriosCore selects the correct `utilitycraft:progress_right_big_bar_*` frame from the machine's current progress and energy cost. Generators that continuously produce energy do not use this processing control.

## Slot outline colors

The source of truth is UtilityCraft's `RP/textures/ui/slots/README.md`.

| Meaning | Control or texture | Text color |
| --- | --- | --- |
| Item resource | `item_resource_slot` | `§q` |
| Liquid resource | `liquid_resource_slot` | `§g` |
| Gas resource | `gas_resource_slot` | `§u` |
| Energy | `energy_slot` | `§s` |
| Disabled | `none_slot` | `§8` |
| Input | `input_slot` | `§9` |
| Extra input | `input_extra_slot` / numbered input | `§b` when used as the secondary role |
| Output | `output_slot` | `§c` |
| Upgrade | `upgrade_slot` | `§d` |
| Fuel | `fuel_slot` | `§v` |

The same functional colors are used in each Info description and IO mode list, so the text matches the slot outline and the face-mode buttons.

## IO mode IDs are not labels

The `id` passed to `registerIOInterface` is a closed visual state consumed by `uc.io_face_outline`; it is not a free-form semantic name. Use only states implemented by UtilityCraft UI Core:

- `disabled`, `none`, `normal`;
- `input_1` through `input_9`;
- `output_1` through `output_9`;
- `both`, `upgrade`, `fuel`;
- `item_resource`, `liquid_resource`, `gas_resource`, `energy`.

For example, a hydrogen tank still uses `{ id: "input_1", inputIndices: [0] }`. The human-readable phrase “Hydrogen Input” belongs in the `ui.utilitycraft:io.*` language entry. Inventing an ID such as `hydrogen` changes the operational policy but leaves the button without a matching outline binding.

## Adding another screen

1. Reserve runtime slots before selecting UI indices. Keep display, operational, upgrade and IO-button slots disjoint.
2. Add the top panel to `example_machinery.json` using `collection_name: "container_items"`.
3. Route the entity translation key from `chest_screen.json` to the new utility panel.
4. Add Info and IO language entries to `texts/en_US.lang` using the canonical colors above.
5. Confirm that every index is lower than `entity.inventory_size` and that the six visual IO indices match `registerIOInterface` exactly.
