import {Point} from './constants';
import {getDistanceBetweenTwoPoints} from './get-distance-between-two-points';

// When going from 1° -> 359° longitude, we don't go around the whole earth
export const getCloserEndPoint = (startPoint: Point, endPoint: Point) => {
	const endPointWith1ExtraRotation: Point = {
		latitude: endPoint.latitude,
		longitude: endPoint.longitude - 360,
	};

	const distanceBetweenOriginalPoint = getDistanceBetweenTwoPoints(
		endPoint,
		startPoint
	);
	const distanceBetweenPointWithExtraRotation = getDistanceBetweenTwoPoints(
		endPointWith1ExtraRotation,
		startPoint
	);

	if (distanceBetweenPointWithExtraRotation < distanceBetweenOriginalPoint) {
		return endPointWith1ExtraRotation;
	}

	return endPoint;
};
