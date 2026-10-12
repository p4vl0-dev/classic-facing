import { resolveMirror } from "./mirror.js";

/**
 * Texture patch that makes the token face the movement, or null if it already does.
 * Values are absolute, so applying the patch twice is harmless.
 */
export function buildFlipPatch(tokenDocument, delta) {
	const mirror = resolveMirror(tokenDocument, delta);
	if (!mirror) return null;

	const current = tokenDocument.toObject().texture[mirror.key];
	if ((current < 0) === mirror.mirrored) return null;
	return { [`texture.${mirror.key}`]: Math.abs(current) * (mirror.mirrored ? -1 : 1) };
}
