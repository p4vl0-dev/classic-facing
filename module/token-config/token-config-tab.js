import { FLAGS, FacingMode, MODULE_ID, SETTINGS, TAB_ID, TOKEN_CONFIG_TEMPLATE } from "../constants.js";
import { getSetting } from "../config.js";
import { buildFacingChoices, buildModeChoices, fillSelect } from "../ui/select.js";

const fieldSelector = (key) => `[name="flags.${MODULE_ID}.${key}"]`;

/** Adds the tab entry to both token config sheets. */
export function registerTokenConfigTabs() {
	const { TokenConfig, PrototypeTokenConfig } = foundry.applications.sheets;
	for (const sheet of [TokenConfig, PrototypeTokenConfig]) {
		const tabs = sheet.TABS?.sheet?.tabs;
		// Prototype sheet may share the parent's TABS object, avoid a double entry.
		if (!tabs || tabs.some((tab) => tab.id === TAB_ID)) continue;
		tabs.push({ id: TAB_ID, label: "CLASSIC_FACING.Tab", icon: "fas fa-caret-down fa-fw" });
	}
}

/**
 * Injects the tab content into a token config sheet.
 * @param {HTMLElement} form
 * @param {object} data      Render context.
 * @param {string} docPath   Context key holding the document ("source" on the prototype sheet).
 */
export async function renderTokenConfigTab(form, data, docPath = "document") {
	if (form.querySelector(`.tab[data-tab="${TAB_ID}"]`)) return;

	const flags = data[docPath]?.flags?.[MODULE_ID] ?? {};
	const mode = flags[FLAGS.FLIP_OR_ROTATE] || FacingMode.GLOBAL;

	const html = await foundry.applications.handlebars.renderTemplate(TOKEN_CONFIG_TEMPLATE, {
		tab: data.tabs?.[TAB_ID],
		indicatorDisabled: flags[FLAGS.INDICATOR_DISABLED],
		flipDisabled: flags[FLAGS.FLIP_DISABLED],
		flipOrRotate: mode,
		facingDirection: flags[FLAGS.FACING_DIRECTION] || FacingMode.GLOBAL,
		rotationOffset: flags[FLAGS.ROTATION_OFFSET] ?? 0,
		flipOrRotates: buildModeChoices(),
		facingDirections: buildFacingChoices(mode),
	});
	[...form.querySelectorAll(".tab")].pop()?.insertAdjacentHTML("afterend", html);

	const modeSelect = form.querySelector(fieldSelector(FLAGS.FLIP_OR_ROTATE));
	const facingSelect = form.querySelector(fieldSelector(FLAGS.FACING_DIRECTION));
	modeSelect?.addEventListener("change", (event) => {
		const choices = buildFacingChoices(event.target.value);
		const selected = FacingMode.GLOBAL in choices ? FacingMode.GLOBAL : getSetting(SETTINGS.FACING_DIRECTION);
		fillSelect(facingSelect, choices, selected);
	});
}
