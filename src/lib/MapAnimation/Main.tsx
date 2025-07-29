import {evolvePath} from '@remotion/paths';
import React, {useMemo} from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {CenterPoint} from './CenterPoint';
import {getCloserEndPoint} from './get-closer-end-point';
import {Area, TilesLayer} from './TilesLayer';
import {getArea, getOffset} from './get-area';
import {Point, VideoProps} from '../constants';
import {Label, LabelPosition} from './Label';
import {getZoom} from './get-zoom';

const START_DELAY = 40;
const DURATION = 90;

const outer: React.CSSProperties = {
	backgroundColor: 'white',
};

const getPath = ({
	width,
	height,
	endPointOffset,
	startPointOffset,
}: {
	width: number;
	height: number;
	endPointOffset: {x: number; y: number};
	startPointOffset: {x: number; y: number};
}) => {
	const start = [
		width / 2 + startPointOffset.x,
		height / 2 + startPointOffset.y,
	];
	const end = [width / 2 + endPointOffset.x, height / 2 + endPointOffset.y];
	const controlPoint = [
		(start[0] + end[0]) / 2,
		[(start[1] + end[1]) / 2 - 400],
	];

	return `M ${start.join(' ')} Q ${controlPoint.join(' ')} ${end.join(' ')}`;
};

export const Main: React.FC<VideoProps> = ({
	endLabel,
	endPoint: unclampedEndPoint,
	startLabel,
	startPoint,
}) => {
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();
	const closerEndPoint = getCloserEndPoint(startPoint, unclampedEndPoint);
	const zoom = getZoom(startPoint, closerEndPoint);

	const animation = interpolate(
		frame,
		[START_DELAY, START_DELAY + DURATION],
		[0, 1],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.inOut(Easing.ease),
		}
	);

	const zoomInEndPoint = spring({
		fps,
		frame: frame - START_DELAY - DURATION + 3,
		config: {
			damping: 200,
		},
		durationInFrames: 20,
	});

	const startLabelOpacity =
		1 -
		spring({
			fps,
			frame: frame - START_DELAY,
			config: {
				damping: 200,
			},
			durationInFrames: 20,
		});

	const endLabelOpacity = spring({
		fps,
		frame: frame - START_DELAY - DURATION,
		config: {
			damping: 200,
		},
		durationInFrames: 20,
	});

	const center: Point = useMemo(() => {
		return {
			latitude: interpolate(
				animation,
				[0, 1],
				[startPoint.latitude, closerEndPoint.latitude]
			),
			longitude: interpolate(
				animation,
				[0, 1],
				[startPoint.longitude, closerEndPoint.longitude]
			),
		};
	}, [
		animation,
		closerEndPoint.latitude,
		closerEndPoint.longitude,
		startPoint.latitude,
		startPoint.longitude,
	]);

	const originalOffset = useMemo(() => {
		return getOffset({
			center: startPoint,
			height,
			width,
			zoom,
		});
	}, [height, startPoint, width, zoom]);

	const endOffset = useMemo(() => {
		return getOffset({
			center: closerEndPoint,
			height,
			width,
			zoom,
		});
	}, [closerEndPoint, height, width, zoom]);

	const startMarkerXPosition = -interpolate(
		animation,
		[0, 1],
		[0, endOffset.x - originalOffset.x]
	);
	const startMarkerYPosition = -interpolate(
		animation,
		[0, 1],
		[0, endOffset.y - originalOffset.y]
	);
	const endMarkerXPosition = -interpolate(
		animation,
		[0, 1],
		[originalOffset.x - endOffset.x, 0]
	);
	const endMarkerYPosition = -interpolate(
		animation,
		[0, 1],
		[originalOffset.y - endOffset.y, 0]
	);

	const offsetDifference = useMemo(() => {
		return {
			x: endOffset.x - originalOffset.x,
			y: endOffset.y - originalOffset.y,
		};
	}, [endOffset.x, endOffset.y, originalOffset.x, originalOffset.y]);

	const startMarkerStyle = useMemo(() => {
		return {
			x: startMarkerXPosition,
			y: startMarkerYPosition,
		};
	}, [startMarkerXPosition, startMarkerYPosition]);

	const endMarkerStyle = useMemo(() => {
		return {
			x: endMarkerXPosition,
			y: endMarkerYPosition,
		};
	}, [endMarkerXPosition, endMarkerYPosition]);

	const offset = useMemo(
		() =>
			getOffset({
				zoom,
				center,
				height,
				width,
			}),
		[center, height, width, zoom]
	);

	const area: Area = useMemo(() => {
		return getArea({
			...center,
			height,
			width,
			zoom,
		});
	}, [center, height, width, zoom]);

	const d = getPath({
		height,
		endPointOffset: offsetDifference,
		startPointOffset: {x: 0, y: 0},
		width,
	});

	const {strokeDasharray, strokeDashoffset} = evolvePath(animation, d);

	const endLabelPosition: LabelPosition =
		closerEndPoint.latitude > startPoint.latitude ? 'above' : 'below';
	const startLabelPosition: LabelPosition =
		startPoint.latitude > closerEndPoint.latitude ? 'above' : 'below';

	return (
		<AbsoluteFill style={outer}>
			<AbsoluteFill>
				<TilesLayer area={area} offset={offset} zoom={zoom} />
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					marginLeft: startMarkerStyle.x,
					marginTop: startMarkerStyle.y,
				}}
			>
				<svg
					viewBox={`0 0 ${width} ${height}`}
					style={{
						overflow: 'visible',
					}}
				>
					<path
						strokeDasharray={strokeDasharray}
						strokeDashoffset={strokeDashoffset}
						strokeLinecap={'round'}
						d={d}
						fill="none"
						stroke="white"
						strokeWidth={42}
					/>
				</svg>
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					marginLeft: startMarkerStyle.x,
					marginTop: startMarkerStyle.y,
				}}
			>
				<CenterPoint />
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					marginLeft: startMarkerStyle.x,
					marginTop: startMarkerStyle.y,
					opacity: startLabelOpacity,
					pointerEvents: 'none',
				}}
			>
				<Label label={startLabel} position={startLabelPosition} />
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					marginLeft: endMarkerStyle.x,
					marginTop: endMarkerStyle.y,
					scale: String(zoomInEndPoint),
				}}
			>
				<CenterPoint />
			</AbsoluteFill>

			<AbsoluteFill
				style={{
					marginLeft: endMarkerStyle.x,
					marginTop: endMarkerStyle.y,
					opacity: endLabelOpacity,
					pointerEvents: 'none',
				}}
			>
				<Label label={endLabel} position={endLabelPosition} />
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					marginLeft: startMarkerStyle.x,
					marginTop: startMarkerStyle.y,
					pointerEvents: 'none',
				}}
			>
				<svg
					viewBox={`0 0 ${width} ${height}`}
					style={{
						overflow: 'visible',
					}}
				>
					<path
						strokeDasharray={strokeDasharray}
						strokeDashoffset={strokeDashoffset}
						strokeLinecap={'round'}
						d={d}
						fill="none"
						stroke="#ff0041"
						strokeWidth={18}
					/>
				</svg>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
