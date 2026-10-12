import { MODULE_ID } from "./constants.js";

/** Opt-in tracing: run `CONFIG.debug.classicFacing = true` in the console. */
export function debug(...args) {
	if (CONFIG.debug?.classicFacing) console.debug(`${MODULE_ID} |`, ...args);
}
