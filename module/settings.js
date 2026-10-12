import {
	FACING_CHOICES,
	FACING_LABELS,
	FacingMode,
	IndicatorMode,
	IndicatorShape,
	MODE_LABELS,
	MODULE_ID,
	SETTINGS,
} from "./constants.js";
import { refreshAllIndicators } from "./indicator/indicator-manager.js";

// Per-system defaults, matched by substring of the system id.
const SYSTEM_DEFAULTS = {
	gurps: { [SETTINGS.LOCK_TO_GRID]: true, [SETTINGS.FLIP_OR_ROTATE]: FacingMode.ROTATE },
};

function getSystemDefaults() {
	const match = Object.keys(SYSTEM_DEFAULTS).find((id) => game.system.id.includes(id));
	return SYSTEM_DEFAULTS[match] ?? {};
}

const labels = (key) => ({
	name: `CLASSIC_FACING.Settings.${key}.Name`,
	hint: `CLASSIC_FACING.Settings.${key}.Hint`,
});

const register = (key, data) => game.settings.register(MODULE_ID, key, { scope: "world", config: true, ...data });

const redraw = () => refreshAllIndicators();
const rebuild = () => refreshAllIndicators({ rebuild: true });

const INDICATOR_MODE_CHOICES = {
	[IndicatorMode.OFF]: "CLASSIC_FACING.IndicatorMode.Off",
	[IndicatorMode.HOVER]: "CLASSIC_FACING.IndicatorMode.Hover",
	[IndicatorMode.ALWAYS]: "CLASSIC_FACING.IndicatorMode.Always",
};

export function registerSettings() {
	const defaults = getSystemDefaults();

	register(SETTINGS.ARROW_COLOR, {
		...labels("ArrowColor"),
		type: new foundry.data.fields.ColorField({ nullable: false, initial: "#000000" }),
		onChange: rebuild,
	});

	register(SETTINGS.ARROW_DISTANCE, {
		...labels("ArrowDistance"),
		type: Number,
		default: 1.4,
		range: { min: 1.0, max: 1.4, step: 0.05 },
		onChange: redraw,
	});

	register(SETTINGS.INDICATOR_SIZE, {
		...labels("IndicatorSize"),
		type: Number,
		default: 1.0,
		range: { min: 0.5, max: 2.0, step: 0.05 },
		onChange: redraw,
	});

	register(SETTINGS.INDICATOR_MODE_NPC, {
		...labels("IndicatorModeNpc"),
		type: Number,
		default: IndicatorMode.ALWAYS,
		choices: INDICATOR_MODE_CHOICES,
		onChange: redraw,
	});

	register(SETTINGS.INDICATOR_MODE_PC, {
		...labels("IndicatorModePc"),
		type: Number,
		default: IndicatorMode.ALWAYS,
		choices: INDICATOR_MODE_CHOICES,
		onChange: redraw,
	});

	register(SETTINGS.INDICATOR_SHAPE, {
		...labels("IndicatorShape"),
		type: Number,
		default: IndicatorShape.ARROW,
		choices: {
			[IndicatorShape.ARROW]: "CLASSIC_FACING.Settings.IndicatorShape.Arrow",
			[IndicatorShape.LINE]: "CLASSIC_FACING.Settings.IndicatorShape.Line",
		},
		onChange: rebuild,
	});

	register(SETTINGS.COMBAT_ONLY, {
		...labels("CombatOnly"),
		type: Boolean,
		default: false,
		onChange: redraw,
	});

	register(SETTINGS.HIDE_ON_DEFEATED, {
		...labels("HideOnDefeated"),
		type: Boolean,
		default: true,
		onChange: redraw,
	});

	register(SETTINGS.LOCK_TO_GRID, {
		...labels("LockToGrid"),
		type: Boolean,
		default: defaults[SETTINGS.LOCK_TO_GRID] ?? false,
	});

	register(SETTINGS.FLIP_OR_ROTATE, {
		...labels("FlipOrRotate"),
		type: new foundry.data.fields.StringField({
			required: true,
			initial: defaults[SETTINGS.FLIP_OR_ROTATE] ?? FacingMode.FLIP_H,
			choices: MODE_LABELS,
		}),
	});

	// The settings form narrows this list to match the chosen turn mode (see settings-ui.js).
	register(SETTINGS.FACING_DIRECTION, {
		...labels("FacingDirection"),
		type: String,
		default: "right",
		choices: FACING_LABELS,
	});
}
