// @ts-check

import { openLinkNodeIOForm } from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";

// Every configurable port can share this component. DoriosCore resolves which
// active controller owns the port, then builds the correct item/fluid/gas form.
DoriosLib.registry.blockComponent("utilitycraft:example_link_node_port", {
  onPlayerInteract({ block, player }) {
    if (!block || !player) return;
    void openLinkNodeIOForm(block, player);
  },
});

