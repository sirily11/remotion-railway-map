import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';

const container: React.CSSProperties = {
	justifyContent: 'center',
	alignItems: 'center',
};

const dot: React.CSSProperties = {
	height: 60,
	width: 60,
	backgroundColor: '#ff0041',
	borderRadius: 30,
	border: '12px solid white',
};

export const CenterPoint: React.FC<{}> = ({}) => {
	const innerStyle = useMemo(() => {
		return dot;
	}, []);

	return (
		<AbsoluteFill style={container}>
			<div style={innerStyle} />
		</AbsoluteFill>
	);
};
