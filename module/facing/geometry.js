/** Grid kind index: 0 = square/gridless, 1 = hex rows, 2 = hex columns. */
export const getGridKind = () => Math.floor(canvas.grid.type / 2);

export const isGridless = () => canvas.grid.type === CONST.GRID_TYPES.GRIDLESS;

/** Wraps an angle into (-180, 180]. */
export function normalizeAngle(angle) {
	const wrapped = ((angle % 360) + 360) % 360;
	return wrapped > 180 ? wrapped - 360 : wrapped;
}

/** Angle of a movement vector in degrees, 0 = east. */
export const vectorAngle = ({ x, y }) => (Math.atan2(y, x) * 180) / Math.PI;

// Allowed facings per grid kind: base + k * step.
const SNAP = [
	{ base: 0, step: 45 },
	{ base: 0, step: 60 },
	{ base: 30, step: 60 },
];

/** Snaps an angle to the nearest grid facing; ties go to the lower one. */
export function snapAngle(angle, gridKind) {
	const { base, step } = SNAP[gridKind] ?? SNAP[0];
	const wrapped = ((angle % 360) + 360) % 360;
	const snapped = base + Math.ceil((wrapped - base) / step - 0.5) * step;
	return normalizeAngle(snapped);
}
