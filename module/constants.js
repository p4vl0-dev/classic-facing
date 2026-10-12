export const MODULE_ID = "classic-facing";
export const TAB_ID = "classicFacing";
export const TOKEN_CONFIG_TEMPLATE = `modules/${MODULE_ID}/templates/token-config.html`;

export const IndicatorMode = Object.freeze({ OFF: 0, HOVER: 1, ALWAYS: 2 });
export const IndicatorShape = Object.freeze({ ARROW: 0, LINE: 1 });
export const FacingMode = Object.freeze({
	GLOBAL: "global",
	ROTATE: "rotate",
	FLIP_H: "flip-h",
	FLIP_V: "flip-v",
});

/** World setting keys. */
export const SETTINGS = Object.freeze({
	ARROW_COLOR: "arrowColor",
	ARROW_DISTANCE: "arrowDistance",
	INDICATOR_SIZE: "indicatorSize",
	INDICATOR_MODE_NPC: "indicatorModeNpc",
	INDICATOR_MODE_PC: "indicatorModePc",
	INDICATOR_SHAPE: "indicatorShape",
	COMBAT_ONLY: "combatOnly",
	HIDE_ON_DEFEATED: "hideIndicatorOnDead",
	LOCK_TO_GRID: "lockArrowToFace",
	FLIP_OR_ROTATE: "flipOrRotate",
	FACING_DIRECTION: "facingDirection",
});

/** Token flag keys (flags.classic-facing.*). */
export const FLAGS = Object.freeze({
	DIRECTION: "direction",
	FACING_DIRECTION: "facingDirection",
	FLIP_OR_ROTATE: "flipOrRotate",
	ROTATION_OFFSET: "rotationOffset",
	INDICATOR_DISABLED: "indicatorDisabled",
	FLIP_DISABLED: "flipDisabled",
});

/** Canvas angle (degrees, 0 = east, clockwise) for each facing. */
export const FACING_ANGLE = Object.freeze({ right: 0, down: 90, left: 180, up: -90 });

export const FACING_LABELS = Object.freeze({
	right: "CLASSIC_FACING.Direction.Right",
	left: "CLASSIC_FACING.Direction.Left",
	down: "CLASSIC_FACING.Direction.Down",
	up: "CLASSIC_FACING.Direction.Up",
});

export const MODE_LABELS = Object.freeze({
	[FacingMode.ROTATE]: "CLASSIC_FACING.FlipOrRotate.Rotate",
	[FacingMode.FLIP_H]: "CLASSIC_FACING.FlipOrRotate.FlipH",
	[FacingMode.FLIP_V]: "CLASSIC_FACING.FlipOrRotate.FlipV",
});

const pick = (...keys) => Object.fromEntries(keys.map((key) => [key, FACING_LABELS[key]]));

/** Facings that make sense for each turn mode. */
export const FACING_CHOICES = Object.freeze({
	[FacingMode.ROTATE]: pick("right", "left", "down", "up"),
	[FacingMode.FLIP_H]: pick("right", "left"),
	[FacingMode.FLIP_V]: pick("down", "up"),
});
