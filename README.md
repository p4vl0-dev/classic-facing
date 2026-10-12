# Classic Facing

A Foundry VTT v14 module that rotates or flips tokens based on movement direction and draws a facing indicator. A fork of [About Face](https://github.com/mclemente/about-face) but with **classic turn animation speeds** — no accelerated or slowed-down flips.

## Features

- 🔄 **Rotate or flip** tokens on movement (rotate / flip-h / flip-v).
- 🎯 **Facing indicator** — arrow or line, with separate settings for PCs and NPCs.
- ⚙️ **World settings**: color, distance, indicator size, shape, display mode (always / on hover / off).
- 🧩 **Per‑token settings**: facing direction, turn mode, rotation offset, disable indicator/turning.
- 🕹️ **Grid compatibility**: square, hex rows/columns, and gridless.
- ⚔️ **Combat options**: show indicators only in combat, hide on defeated, Alt‑highlight.
- 🎞️ **Turn animation tied to movement duration** (walk / crawl / swim / climb).

## Installation

Paste the manifest URL into Foundry:

```
https://raw.githubusercontent.com/p4vl0-dev/classic-facing/refs/heads/main/module.json
```

Or download the latest release manually: [releases](https://github.com/p4vl0-dev/classic-facing/releases/latest).

## Usage

1. Enable the module in your world (Foundry VTT **v14+**).
2. Go to **Settings → Module Settings → Classic Facing** and choose:
   - turn mode (`Rotate` / `Flip H` / `Flip V`);
   - default art facing;
   - indicator parameters.
3. For individual tokens, open the **Classic Facing** tab in the token config.

## Debugging

In the console:

```js
CONFIG.debug.classicFacing = true
```

## Credits

Based on **About Face** by Eadorin, edzillion, and mclemente. Reworked for Foundry VTT v14 with classic turn animation speeds.
