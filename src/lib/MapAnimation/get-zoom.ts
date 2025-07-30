import {Point} from './constants';
import {TILE_SIZE} from './mercator';

// Left: Degrees per tile, Right: zoom level
const zoomLongitudeMap = {
	'360': 0,
	'180': 1,
	'90': 2,
	'45': 3,
	'22.5': 4,
	'11.25': 5,
	'5.625': 6,
	'2.813': 7,
	'1.406': 8,
	'0.703': 9,
	'0.352': 10,
	'0.176': 11,
	'0.088': 12,
	'0.044': 13,
	'0.022': 14,
	'0.011': 15,
	'0.005': 16,
	'0.003': 17,
	'0.001': 18,
	'0.0005': 19,
	'0.00025': 20,
};

type Unit = keyof typeof zoomLongitudeMap;

const units = Object.keys(zoomLongitudeMap) as Unit[];

const PREFERRED_DISTANCE_PX = 1920;
const PREFERRED_TILE_DISTANCE = PREFERRED_DISTANCE_PX / TILE_SIZE;

export const getZoom = (start: Point, end: Point) => {
	const distanceX = Math.abs(end.latitude - start.latitude);
	const distanceY = Math.abs(end.longitude - start.longitude);

	const triangledDistance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

	const degreesPerTile = triangledDistance / PREFERRED_TILE_DISTANCE;
	const sortedZoomLevels = units.sort((a, b) => {
		return (
			Math.abs(Number(a) - degreesPerTile) -
			Math.abs(Number(b) - degreesPerTile)
		);
	});
	const closestZoomLevel = zoomLongitudeMap[sortedZoomLevels[0]];

	return closestZoomLevel;
};
