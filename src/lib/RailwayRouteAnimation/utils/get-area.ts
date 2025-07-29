import {Point} from './geo-utils';
import {Area} from '../TilesLayer';
import {
	getLatitudeFromY,
	getLongitudeFromX,
	getXFromLongitude,
	getYFromLatitude,
} from './mercator';

const halfSize = (width: number, height: number) => {
	return [width / 2, height / 2];
};

export const getArea = ({
	width,
	height,
	zoom,
	latitude,
	longitude,
}: {
	width: number;
	height: number;
	zoom: number;
	latitude: number;
	longitude: number;
}) => {
	const [w, h] = halfSize(width, height);
	return {
		leftTop: coordinatesAtOffset({
			x: -w,
			y: -h,
			zoom,
			latitude,
			longitude,
		}),
		rightBottom: coordinatesAtOffset({
			x: w,
			y: h,
			zoom,
			latitude,
			longitude,
		}),
	};
};

const coordinatesAtOffset = ({
	x,
	y,
	zoom,
	latitude,
	longitude,
}: {
	x: number;
	y: number;
	zoom: number;
	latitude: number;
	longitude: number;
}) => {
	// Get coordinates of our center on the projection cylinder.
	const mx = getXFromLongitude(longitude, zoom);
	const my = getYFromLatitude(latitude, zoom);
	// Apply the offset to the projection coordinates and get the
	// corresponding latitude and longitude.
	return {
		latitude: getLatitudeFromY(my + y, zoom),
		longitude: getLongitudeFromX(mx + x, zoom),
	};
};

export const getOffset = ({
	zoom,
	center,
	width,
	height,
}: {
	zoom: number;
	center: Point;
	width: number;
	height: number;
}) => {
	// To make coordinates of our elements small we have to put all layers
	// in a relative coordinate system. We might just choose the current
	// center, but then all relative coordinates would have to be
	// recalculated on each rendering. We can't choose a static offset
	// either because that would assume specific zoom and location.

	// So instead we choose a pair of nearby round coordinates. This trims
	// big numbers nicely while being static most of the time (except when
	// the user happens to be at round coordinates).
	const offset = {
		x: Math.floor(getXFromLongitude(center.longitude, zoom) - width / 2),
		y: Math.floor(getYFromLatitude(center.latitude, zoom) - height / 2),
	};

	return offset;
};
