# Multiblock examples

The template contains two controllers using the public `MultiblockMachine` and `MultiblockGenerator` classes:

- `example_factory_crusher`: item input, item output, energy, and scalable processing components.
- `example_biofuel_dynamo`: liquid fuel input, energy output, and capacity components.

## Build a valid structure

Use a hollow rectangular shell large enough to contain the required internal components. Both examples require at least two interior spaces, so a 4×3×3 shell is a useful minimum:

1. Build the outside shell from `example_casing`.
2. Replace a non-corner block in one wall with the controller.
3. Replace other shell blocks with the required ports. Ports carry the same casing tag.
4. Put component blocks inside the hollow volume.
5. Hold a UtilityCraft wrench and interact with the controller to scan and activate it.

The scan accepts only:

- the controller at its scan origin;
- blocks tagged `dorios:multiblock.case.example` on the shell;
- air, liquids, or blocks tagged `dorios:multiblock_component` inside.

Any unrelated block inside or any opening in the casing fails validation and reports the invalid coordinates.

## Factory Crusher

Required interior:

- at least one `example_energy_cell`;
- at least one `example_processing_module`.

Optional `example_speed_module` and `example_efficiency_module` blocks change the addon-owned runtime stats. Add an item port and energy port to the shell. Interact with the active item port to select Material Input or Product Output.

Each energy cell adds 2,000,000 DE. Because the component uses an addon-specific ID, the activation callback calculates and applies that capacity; DoriosCore is not modified.

## Biofuel Dynamo

Required interior:

- at least one `example_energy_cell`;
- at least one `example_fluid_cell`.

Add a liquid port for `example_biofuel` and an energy port for output. Each energy cell adds 4,000,000 DE and each fluid cell adds 128,000 mB.

## Ports and link-node IO

Ports remain ordinary casing blocks until activation. DoriosCore marks them active, associates their coordinates with the controller entity, and updates the corresponding UtilityCore network type. The `example_link_node_port` component opens the public link-node routing form.

The template includes item, liquid, energy, and gas port block definitions. The two included multiblocks exercise item, liquid, and energy routes; gas processing is demonstrated by the standalone Gas Reactor and Gas Turbine.
