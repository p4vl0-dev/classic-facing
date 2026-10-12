import { FACING_CHOICES, FACING_LABELS, FacingMode, MODE_LABELS, SETTINGS } from "../constants.js";
import { getSetting } from "../config.js";

const localize = (key) => game.i18n.localize(key);

/** "Global (Right)" style label for inherited values. */
export const globalLabel = (valueKey) =>
	`${localize("CLASSIC_FACING.FlipOrRotate.Global")} (${localize(valueKey)})`;

/** Replaces <select> options in place. */
export function fillSelect(select, choices, selected) {
	select.replaceChildren(
		...Object.entries(choices).map(([value, label]) => {
			const option = document.createElement("option");
			option.value = value;
			option.textContent = localize(label);
			option.selected = value === selected;
			return option;
		}),
	);
}

/** Turn mode choices for a token, with the inherited world value on top. */
export function buildModeChoices() {
	const worldMode = getSetting(SETTINGS.FLIP_OR_ROTATE);
	return { [FacingMode.GLOBAL]: globalLabel(MODE_LABELS[worldMode]), ...MODE_LABELS };
}

/** Facing choices valid for a token's turn mode; "global" only when the mode is inherited too. */
export function buildFacingChoices(mode) {
	if (mode !== FacingMode.GLOBAL) return { ...FACING_CHOICES[mode] };
	const worldMode = getSetting(SETTINGS.FLIP_OR_ROTATE);
	const worldFacing = getSetting(SETTINGS.FACING_DIRECTION);
	return { [FacingMode.GLOBAL]: globalLabel(FACING_LABELS[worldFacing]), ...FACING_CHOICES[worldMode] };
}
