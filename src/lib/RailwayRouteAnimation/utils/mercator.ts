// From: https://github.com/gaswelder/react-slippy-map/blob/master/src/mercator.js

export const TILE_SIZE = 256;

/*
 * Returns radius of the Mercator cylinder
 * corresponding to the given zoom level.
 */
function radius(zoom: number) {
	const max = TILE_SIZE * 2 ** zoom;
	return max / Math.PI / 2;
}

/*
 * Returns x-coordinate on the Mercator cylinder
 * corresponding to the given longitude.
 *
 * Assumed:
 * longitudes change from -180 to 180;
 * x changes from 0 to R * 2pi.
 */
export function getXFromLongitude(lon: number, zoom: number) {
	// -180..180
	const R = radius(zoom);

	const lambda = toRad(lon); // -pi..pi
	return R * (lambda + Math.PI);
}

/*
 * Returns y-coordinate on the Mercator cylinder
 * corresponding to the given latitude.
 */
export function getYFromLatitude(lat: number, zoom: number) {
	/**
	 * ChatGPT:
	 * In practice, the Mercator projection is typically cut off at around ±85.05113° latitude (in order to avoid the infinities)
	 */

	const R = radius(zoom);

	const phi = toRad(Math.max(-85.05112, Math.min(85.05112, lat))); // -pi/2..pi/2
	let y = R * Math.log(Math.tan(phi / 2 + Math.PI / 4)); // -Inf..Inf

	// Add half the surface because we measure from zero.
	// Invert because we measure from the top.
	y += R * Math.PI;
	return 2 * R * Math.PI - y;
}

/*
 * Returns the latitude corresponding to the given
 * y-coordinate on the Mercator cylinder.
 */
export function getLatitudeFromY(y: number, zoom: number) {
	const R = radius(zoom);

	// Invert because we measure from top.
	// Subtract half because we measure from zero.
	y = 2 * R * Math.PI - y;
	y -= R * Math.PI;

	const ky = y / R;
	return toDeg(2 * (Math.atan(Math.exp(ky)) - Math.PI / 4));
}

/*
 * Returns the longitude corresponding to the given
 * x-coordinate on the Mercator cylinder.
 */
export function getLongitudeFromX(x: number, zoom: number) {
	const R = radius(zoom);

	let lambda = x / R; // 0..2pi
	lambda -= Math.PI; // -pi..pi
	return toDeg(lambda);
}

function toDeg(rad: number) {
	return (rad / Math.PI) * 180;
}

function toRad(deg: number) {
	return (deg * Math.PI) / 180;
}
