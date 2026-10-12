/**
 * Classic Facing
 * Turns tokens (rotate or flip) and draws a facing indicator based on movement.
 * Fork of About Face by Eadorin, edzillion, mclemente.
 */
import { registerSettings } from "./settings.js";
import { onRenderSettingsConfig } from "./settings-ui.js";
import { onMoveToken, onPreCreateToken, onPreMoveToken, onPreUpdateToken } from "./facing/token-facing.js";
import {
	onCombatChange,
	onHighlightObjects,
	onHoverToken,
	refreshAllIndicators,
	refreshIndicator,
} from "./indicator/indicator-manager.js";
import { registerTokenConfigTabs, renderTokenConfigTab } from "./token-config/token-config-tab.js";

const refreshFromDocument = (tokenDocument) => refreshIndicator(tokenDocument.object);

Hooks.once("init", () => {
	registerSettings();
	registerTokenConfigTabs();
});

// Facing logic
Hooks.on("preCreateToken", onPreCreateToken);
Hooks.on("preMoveToken", onPreMoveToken);
Hooks.on("preUpdateToken", onPreUpdateToken);
Hooks.on("moveToken", onMoveToken);

// Indicator lifecycle
Hooks.on("canvasReady", () => refreshAllIndicators());
Hooks.on("createToken", refreshFromDocument);
Hooks.on("updateToken", refreshFromDocument);
Hooks.on("refreshToken", (token, flags) => {
	if (flags.redrawEffects) refreshIndicator(token);
});
Hooks.on("hoverToken", onHoverToken);
Hooks.on("highlightObjects", onHighlightObjects);
Hooks.on("combatStart", onCombatChange);
Hooks.on("updateCombat", onCombatChange);
Hooks.on("deleteCombat", onCombatChange);

// UI
Hooks.on("renderSettingsConfig", onRenderSettingsConfig);
Hooks.on("renderTokenConfig", (_app, form, data) => renderTokenConfigTab(form, data));
Hooks.on("renderPrototypeTokenConfig", (_app, form, data) => renderTokenConfigTab(form, data, "source"));
