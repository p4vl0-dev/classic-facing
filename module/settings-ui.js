import { FACING_CHOICES, MODULE_ID, SETTINGS } from "./constants.js";
import { getSetting } from "./config.js";
import { fillSelect } from "./ui/select.js";

/** Keeps the world "facing" select in sync with the chosen turn mode. */
export function onRenderSettingsConfig(_app, html) {
	if (!game.user.isGM) return;

	const modeSelect = html.querySelector(`select[name="${MODULE_ID}.${SETTINGS.FLIP_OR_ROTATE}"]`);
	const facingSelect = html.querySelector(`select[name="${MODULE_ID}.${SETTINGS.FACING_DIRECTION}"]`);
	if (!modeSelect || !facingSelect) return;

	const sync = (mode) => fillSelect(facingSelect, FACING_CHOICES[mode] ?? {}, getSetting(SETTINGS.FACING_DIRECTION));
	sync(getSetting(SETTINGS.FLIP_OR_ROTATE));
	modeSelect.addEventListener("change", (event) => sync(event.target.value));
}
