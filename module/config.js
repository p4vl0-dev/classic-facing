import { FLAGS, FacingMode, MODULE_ID, SETTINGS } from "./constants.js";

export const getSetting = (key) => game.settings.get(MODULE_ID, key);

/** Raw flag read; works on documents that are not created yet. */
export const readFlag = (doc, key) => doc.flags?.[MODULE_ID]?.[key];

const isOverride = (value) => Boolean(value) && value !== FacingMode.GLOBAL;

/** Token turn mode with the "global" fallback resolved. */
export function resolveFlipOrRotate(doc) {
	const value = readFlag(doc, FLAGS.FLIP_OR_ROTATE);
	return isOverride(value) ? value : getSetting(SETTINGS.FLIP_OR_ROTATE);
}

/** Token art facing with the "global" fallback resolved. */
export function resolveFacingDirection(doc) {
	const value = readFlag(doc, FLAGS.FACING_DIRECTION);
	return isOverride(value) ? value : getSetting(SETTINGS.FACING_DIRECTION);
}
