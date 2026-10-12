import { FLAGS, IndicatorMode, MODULE_ID, SETTINGS } from "../constants.js";
import { getSetting, readFlag } from "../config.js";

// Alt-highlight reveals hover-mode indicators on every token.
let highlightActive = false;
export const setHighlightActive = (state) => {
	highlightActive = Boolean(state);
};

const isCombatRunning = () => game.combats.some((combat) => combat.started);

function isDefeated(token) {
	const { DEFEATED } = CONFIG.specialStatusEffects;
	return token.actor?.effects.some((effect) => effect.statuses.has(DEFEATED)) ?? false;
}

/** Indicator mode that applies to this token (PC and NPC have separate settings). */
export function getIndicatorMode(token) {
	const key = token.actor?.hasPlayerOwner ? SETTINGS.INDICATOR_MODE_PC : SETTINGS.INDICATOR_MODE_NPC;
	return Number(getSetting(key));
}

/** True when the token must not show an indicator regardless of mode. */
export function isIndicatorSuppressed(token) {
	if (token.document.isSecret) return true;
	if (getSetting(SETTINGS.COMBAT_ONLY) && !isCombatRunning()) return true;
	return getSetting(SETTINGS.HIDE_ON_DEFEATED) && isDefeated(token);
}

export function isIndicatorVisible(token, hovered = token.hover) {
	if (readFlag(token.document, FLAGS.INDICATOR_DISABLED)) return false;
	switch (getIndicatorMode(token)) {
		case IndicatorMode.ALWAYS:
			return true;
		case IndicatorMode.HOVER:
			return Boolean(hovered) || highlightActive;
		default:
			return false;
	}
}
