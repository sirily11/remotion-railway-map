import {Point} from '../constants';

export const getDistanceBetweenTwoPoints = (start: Point, end: Point) => {
	const distanceX = Math.abs(end.latitude - start.latitude);
	const distanceY = Math.abs(end.longitude - start.longitude);

	return Math.sqrt(distanceX ** 2 + distanceY ** 2);
};
