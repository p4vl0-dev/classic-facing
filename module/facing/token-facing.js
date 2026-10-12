import { FACING_ANGLE, FLAGS, FacingMode, MODULE_ID, SETTINGS } from "../constants.js";
import { getSetting, readFlag, resolveFacingDirection, resolveFlipOrRotate } from "../config.js";
import { debug } from "../debug.js";
import { scheduleFacingUpdate } from "./deferred-update.js";
import { buildFlipPatch } from "./flip.js";
import { getFlipDuration } from "./flip-timing.js";
import { getGridKind, isGridless, normalizeAngle, snapAngle, vectorAngle } from "./geometry.js";

// Core's autoRotate verdict per token, captured in preMoveToken for the update that follows.
const coreAutoRotate = new Map();

/**
 * True when the module drives this token's turning. Off when the token opted out
 * (checkbox) or has its rotation locked; core then decides on its own.
 */
function isTurnManaged(tokenDocument) {
	return !readFlag(tokenDocument, FLAGS.FLIP_DISABLED) && !tokenDocument.lockRotation;
}

/** Seeds the stored direction on creation so the indicator starts correct. */
export function onPreCreateToken(tokenDocument) {
	if (!readFlag(tokenDocument, FLAGS.FACING_DIRECTION)) return;
	if (readFlag(tokenDocument, FLAGS.DIRECTION) !== undefined) return;

	const mode = resolveFlipOrRotate(tokenDocument);
	const gridKind = getGridKind();
	const applies = gridKind === 0
		|| (gridKind === 1 && mode === FacingMode.FLIP_H)
		|| (gridKind === 2 && mode === FacingMode.FLIP_V);
	if (!applies) return;

	const angle = FACING_ANGLE[resolveFacingDirection(tokenDocument)];
	tokenDocument.updateSource({ flags: { [MODULE_ID]: { [FLAGS.DIRECTION]: angle } } });
}

/**
 * Switches core auto-rotation per token: on for "Rotate" tokens, off for the rest.
 * Opted-out and rotation-locked tokens keep whatever core decided.
 */
export function onPreMoveToken(tokenDocument, movement) {
	if (isTurnManaged(tokenDocument)) movement.autoRotate = resolveFlipOrRotate(tokenDocument) === FacingMode.ROTATE;
	coreAutoRotate.set(tokenDocument.id, movement.autoRotate);
	debug("preMoveToken", tokenDocument.name, { autoRotate: movement.autoRotate });
}

/** Tracks facing on movement/rotation and applies the token's turn mode. */
export function onPreUpdateToken(tokenDocument, updates, options) {
	const rotates = coreAutoRotate.get(tokenDocument.id) ?? true;
	coreAutoRotate.delete(tokenDocument.id);

	if (isForeignUpdate(tokenDocument, updates, options)) return;

	const move = readMove(tokenDocument, updates);
	const rotationChanged = updates.rotation !== undefined && updates.rotation !== tokenDocument.rotation;
	debug("preUpdateToken", tokenDocument.name, { moved: move.moved, rotationChanged, updates, options });
	if (!move.moved && !rotationChanged) return;

	const direction = resolveDirection(tokenDocument, updates, move);
	foundry.utils.setProperty(updates, `flags.${MODULE_ID}.${FLAGS.DIRECTION}`, direction);

	if (resolveFlipOrRotate(tokenDocument) === FacingMode.ROTATE) {
		if (move.moved && rotates && isTurnManaged(tokenDocument)) applyRotation(tokenDocument, updates, options, direction, move);
	} else if (!readFlag(tokenDocument, FLAGS.FLIP_DISABLED)) {
		applyFlip(tokenDocument, updates, options, move);
	}
}

/**
 * Safety net: after the move, make sure a flip token ended up facing its travel direction.
 * No-op when preUpdateToken already did the job.
 */
export function onMoveToken(tokenDocument, movement, _operation, user) {
	if (user.id !== game.user.id) return;
	if (resolveFlipOrRotate(tokenDocument) === FacingMode.ROTATE) return;
	if (readFlag(tokenDocument, FLAGS.FLIP_DISABLED)) return;

	const { origin, destination } = movement;
	if (!origin || !destination) return;
	const delta = { x: destination.x - origin.x, y: destination.y - origin.y };
	if (!delta.x && !delta.y) return;

	const patch = buildFlipPatch(tokenDocument, delta);
	debug("moveToken", tokenDocument.name, { delta, patch });
	if (!patch) return;
	const duration = getFlipDuration(Math.hypot(delta.x, delta.y), tokenDocument);
	scheduleFacingUpdate(tokenDocument, patch, { duration });
}

// Updates replicated by other modules must not be re-interpreted as player moves.
function isForeignUpdate(tokenDocument, updates, options) {
	const mlt = game.modules.get("multilevel-tokens");
	if (mlt?.active && !game.multilevel._isReplicatedToken(tokenDocument) && options?.mlt_bypass) return true;
	return Boolean(updates.level && updates.level !== tokenDocument.level);
}

function readMove(tokenDocument, updates) {
	const { x, y } = updates;
	const moved = (x !== undefined && x !== tokenDocument.x) || (y !== undefined && y !== tokenDocument.y);
	const delta = moved
		? { x: (x ?? tokenDocument.x) - tokenDocument.x, y: (y ?? tokenDocument.y) - tokenDocument.y }
		: null;
	return { moved, delta };
}

/** Facing angle the indicator should show (rotation 0 faces south, hence the 90 shift). */
function resolveDirection(tokenDocument, updates, move) {
	if (!move.moved) return normalizeAngle((updates.rotation ?? tokenDocument.rotation) + 90);

	// Prefer the rotation core computed for this movement, else derive it from the path.
	let direction = updates.rotation !== undefined ? updates.rotation + 90 : vectorAngle(move.delta);
	if (getSetting(SETTINGS.LOCK_TO_GRID) && !isGridless()) direction = snapAngle(direction, getGridKind());
	return normalizeAngle(direction);
}

/** Flip and rotation share one timing so both turn at the same pace. */
function applyTurnTiming(tokenDocument, updates, options, move) {
	const action = updates.movementAction ?? tokenDocument.movementAction;
	const duration = getFlipDuration(Math.hypot(move.delta.x, move.delta.y), tokenDocument, action);
	if (duration > 0) options.animation = { ...options.animation, duration, linkToMovement: false };
	else options.animate = false; // teleport: no travel, so no turn animation either
}

function applyRotation(tokenDocument, updates, options, direction, move) {
	if (getSetting(SETTINGS.LOCK_TO_GRID) && !isGridless()) {
		const offset = readFlag(tokenDocument, FLAGS.ROTATION_OFFSET) ?? 0;
		updates.rotation = direction - 90 + offset;
	}
	// Only time the turn if the token actually turns.
	const target = updates.rotation ?? direction - 90;
	if (Math.abs(normalizeAngle(target - tokenDocument.rotation)) < 1) return;
	applyTurnTiming(tokenDocument, updates, options, move);
}

function applyFlip(tokenDocument, updates, options, move) {
	const patch = buildFlipPatch(tokenDocument, move.delta);
	if (!patch) return;

	if (canvas.tokens?.controlled.length > 1) {
		// Group moves: flip after the move so every token animates on its own.
		const action = updates.movementAction ?? tokenDocument.movementAction;
		const distance = move.delta ? Math.hypot(move.delta.x, move.delta.y) : 0;
		scheduleFacingUpdate(tokenDocument, patch, { duration: getFlipDuration(distance, tokenDocument, action) });
		return;
	}

	Object.assign(updates, patch);
	if (move.delta) applyTurnTiming(tokenDocument, updates, options, move);
	else options.animate = false;
}
