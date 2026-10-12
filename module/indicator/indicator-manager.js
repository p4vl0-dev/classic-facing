import { IndicatorMode, MODULE_ID, SETTINGS } from "../constants.js";
import { getSetting } from "../config.js";
import { renderIndicator, setIndicatorVisible } from "./indicator-view.js";
import {
	getIndicatorMode,
	isIndicatorSuppressed,
	isIndicatorVisible,
	setHighlightActive,
} from "./indicator-visibility.js";

/** Redraws one token's indicator, or hides it when it is suppressed. */
export function refreshIndicator(token, { rebuild = false, hovered } = {}) {
	if (!token?.document) return;
	try {
		if (isIndicatorSuppressed(token)) {
			setIndicatorVisible(token, false);
			return;
		}
		const container = renderIndicator(token, { rebuild });
		container.visible = isIndicatorVisible(token, hovered);
	} catch (error) {
		console.error(`${MODULE_ID} | Failed to draw indicator for "${token.name}" (${token.id})`, error);
	}
}

export function refreshAllIndicators(options) {
	for (const token of canvas?.tokens?.placeables ?? []) refreshIndicator(token, options);
}

export function onHoverToken(token, hovered) {
	if (getIndicatorMode(token) !== IndicatorMode.HOVER) return;
	refreshIndicator(token, { hovered });
}

export function onHighlightObjects(active) {
	setHighlightActive(active);
	refreshAllIndicators();
}

/** Combat state only matters when indicators are limited to combat. */
export function onCombatChange() {
	if (getSetting(SETTINGS.COMBAT_ONLY)) refreshAllIndicators();
}
