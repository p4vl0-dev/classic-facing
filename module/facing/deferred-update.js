import { MODULE_ID } from "../constants.js";

// Short debounce lets a whole selection finish its move before facing updates go out.
const FLUSH_DELAY_MS = 50;

const pending = new Map();
let timer = null;

/**
 * Applies a facing patch (flip/rotation) in a separate update after the move.
 * duration 0 means instant, no animation.
 */
export function scheduleFacingUpdate(tokenDocument, patch, { duration = 0 } = {}) {
	const job = pending.get(tokenDocument.id) ?? { tokenDocument, patch: {} };
	Object.assign(job.patch, patch);
	job.duration = duration;
	pending.set(tokenDocument.id, job);

	clearTimeout(timer);
	timer = setTimeout(flush, FLUSH_DELAY_MS);
}

async function flush() {
	const jobs = [...pending.values()];
	pending.clear();
	timer = null;
	for (const job of jobs) await applyJob(job);
}

async function applyJob({ tokenDocument, patch, duration }) {
	const token = tokenDocument.object;
	if (!token || token.destroyed) return;
	try {
		// An instant update during a walk would snap the token to its destination.
		if (duration === 0) await token.movementAnimationPromise;
		await tokenDocument.update(patch, {
			animate: duration > 0,
			animation: { duration, linkToMovement: false },
		});
	} catch (error) {
		console.error(`${MODULE_ID} | Failed to apply facing update for ${tokenDocument.id}`, error);
	}
}
