const ACTION_SPEED_FACTOR = { crawl: 0.5, swim: 0.5, climb: 0.5 };
const MIN_DURATION_MS = 180;
const MAX_DURATION_MS = 2000;

/** Flip animation length matched to how long the movement itself takes. */
export function getFlipDuration(distance, tokenDocument, action = tokenDocument.movementAction) {
	if (distance <= 0) return 0;

	action ||= "walk";
	if (CONFIG.Token.movement?.actions?.[action]?.teleport) return 0;

	const speed = tokenDocument.movementSpeed > 0
		? tokenDocument.movementSpeed
		: CONFIG.Token.movement.defaultSpeed || 1;
	const multiplier = tokenDocument.speedMultiplier ?? 1;
	const actionFactor = ACTION_SPEED_FACTOR[action] ?? 1;
	const pxPerSecond = speed * (canvas.grid.size || 100) * multiplier * actionFactor;

	const durationMs = (distance / pxPerSecond) * 1000;
	return Math.min(Math.max(durationMs, MIN_DURATION_MS), MAX_DURATION_MS);
}
