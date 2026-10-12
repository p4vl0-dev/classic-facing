import { resolveFacingDirection } from "../config.js";

// Same lookup the core keybinding handler uses for arrow keys.
function readKeyboardDelta() {
	const keys = game.keybindings.moveKeys;
	const { LEFT, RIGHT, UP, DOWN } = foundry.helpers.interaction.ClientKeybindings.MOVEMENT_DIRECTIONS;
	let x = 0;
	let y = 0;
	if (keys.has(LEFT)) x -= 1;
	else if (keys.has(RIGHT)) x += 1;
	if (keys.has(UP)) y -= 1;
	else if (keys.has(DOWN)) y += 1;
	return { x, y };
}

/**
 * Which texture axis to mirror for a movement, and whether it ends up mirrored.
 * Without a delta the pressed movement keys are used instead.
 * @returns {{ key: "scaleX"|"scaleY", mirrored: boolean } | null}
 */
export function resolveMirror(tokenDocument, delta) {
	const { x, y } = delta ?? readKeyboardDelta();
	switch (resolveFacingDirection(tokenDocument)) {
		case "right":
			if (x) return { key: "scaleX", mirrored: x < 0 };
			break;
		case "left":
			if (x) return { key: "scaleX", mirrored: x > 0 };
			break;
		case "up":
			if (y) return { key: "scaleY", mirrored: y > 0 };
			break;
		case "down":
			if (y) return { key: "scaleY", mirrored: y < 0 };
			break;
	}
	return null;
}
