// @ts-check

// Import DoriosCore once so its public listeners and storage systems are ready.
// Addon code must always use the public root entry point shown here.
import "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";

// ExampleCore contains reusable code owned by this addon. Concrete examples
// live under ./examples so the dependency boundary remains easy to see.
import "ExampleCore/index.js";
import "./config/index.js";
import "./examples/index.js";

// Install custom components only after every module has registered its
// definitions. Container and link-node services are initialized afterwards.
DoriosLib.registry.install();
DoriosLib.container.initialize();
DoriosLib.linkNode.initializeLinkNodeIO();

