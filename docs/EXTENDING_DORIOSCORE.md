# Extending DoriosCore safely

DoriosCore is a library dependency, not an addon workspace. The stable addon boundary is its root export file.

```js
import { Machine } from "DoriosCore/index.js";
```

Avoid imports such as `DoriosCore/machinery/machine.js`. A private file can move even when the public root remains compatible.

## Use an addon-owned core

Create one folder whose name clearly belongs to your addon, for example:

```text
BP/scripts/
  DoriosCore/          read-only snapshot
  DoriosLib/           read-only snapshot
  MYADDON_CORE/        reusable classes and helpers owned by your addon
  examples/            concrete registrations and block behavior
```

The pattern used in this template is:

```js
import { Machine } from "DoriosCore/index.js";

export class ThermalMachine extends Machine {
  cool() {
    // Addon-owned behavior may compose and extend the public class.
  }
}
```

Concrete blocks import from the addon core:

```js
import { ThermalMachine } from "ExampleCore/index.js";
```

This keeps three responsibilities separate:

- DoriosCore owns generic machinery contracts.
- UtilityCore owns UtilityCraft network orchestration.
- Your addon core owns mechanics unique to your addon.

## Updating the snapshots

When UtilityCraft raises its minimum version, replace the DoriosCore and DoriosLib snapshot folders as whole dependencies, refresh `types/DoriosCore/index.d.ts`, then run:

```powershell
npm run check
npm run verify:imports
npm run bundle
regolith run build
```

Do not merge addon methods into the snapshots. If a capability is generally useful to every addon, add it to the canonical DoriosCore repository first, document/export it publicly, and then update consumers.

