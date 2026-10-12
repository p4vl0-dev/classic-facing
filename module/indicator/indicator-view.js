import { FACING_ANGLE, FLAGS, IndicatorShape, SETTINGS } from "../constants.js";
import { getSetting, readFlag, resolveFacingDirection } from "../config.js";

// Outline points per shape, drawn from the local origin.
const SHAPES = {
	[IndicatorShape.ARROW]: [[0, -10], [10, 0], [0, 10], [0, 0]],
	[IndicatorShape.LINE]: [[-10, -20], [0, 0], [-10, 20], [0, 0]],
};

const isAlive = (displayObject) => Boolean(displayObject) && !(displayObject.destroyed ?? displayObject._destroyed);

function buildGraphics() {
	const color = foundry.utils.Color.from(getSetting(SETTINGS.ARROW_COLOR)).valueOf();
	const points = SHAPES[getSetting(SETTINGS.INDICATOR_SHAPE)] ?? SHAPES[IndicatorShape.ARROW];

	const graphics = new PIXI.Graphics();
	graphics.beginFill(color, 0.5).lineStyle(2, color, 1).moveTo(0, 0);
	for (const [x, y] of points) graphics.lineTo(x, y);
	graphics.closePath().endFill();
	return graphics;
}

function createContainer(token) {
	const container = new PIXI.Container();
	container.name = "classicFacingIndicator";
	container.graphics = container.addChild(buildGraphics());
	token.addChild(container);
	token.classicFacingIndicator = container;
	return container;
}

/** Stored facing, falling back to the configured default facing. */
function getDirection(tokenDocument) {
	return readFlag(tokenDocument, FLAGS.DIRECTION) ?? FACING_ANGLE[resolveFacingDirection(tokenDocument)] ?? 90;
}

function getMetrics(token) {
	const { w, h, document } = token;
	const distance = (Math.max(w, h) / 2) * getSetting(SETTINGS.ARROW_DISTANCE);

	const gridSize = Math.max(document.width, document.height);
	const textureScale = Math.abs(document.texture.scaleX) + Math.abs(document.texture.scaleY);
	const scale = ((gridSize * textureScale) / 2) * (getSetting(SETTINGS.INDICATOR_SIZE) || 1);

	return { w, h, distance, scale };
}

export function destroyIndicator(token) {
	const container = token.classicFacingIndicator;
	if (isAlive(container)) container.destroy({ children: true });
	token.classicFacingIndicator = null;
}

/** Creates or updates the indicator so it matches the token's current state. */
export function renderIndicator(token, { rebuild = false } = {}) {
	if (rebuild) destroyIndicator(token);
	const container = isAlive(token.classicFacingIndicator) ? token.classicFacingIndicator : createContainer(token);

	const { w, h, distance, scale } = getMetrics(token);
	container.position.set(w / 2, h / 2);
	container.angle = getDirection(token.document);
	container.graphics.x = distance;
	container.graphics.scale.set(scale, scale);
	return container;
}

export function setIndicatorVisible(token, visible) {
	const container = token.classicFacingIndicator;
	if (isAlive(container)) container.visible = visible;
}
