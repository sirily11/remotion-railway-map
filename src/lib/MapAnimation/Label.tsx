import React from 'react';
import {AbsoluteFill} from 'remotion';
import {fontFamily, loadFont} from '@remotion/google-fonts/Lora';

loadFont();

export type LabelPosition = 'top' | 'bottom' | 'left' | 'right';

export const Label: React.FC<{
	label: string;
	position: LabelPosition;
}> = ({label, position}) => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				marginTop: position === 'top' ? -90 : position === 'bottom' ? 90 : 0,
				fontSize: 40,
				fontWeight: 'bold',
				fontFamily,
			}}
		>
			<span
				style={{
					textShadow: '0 0 30px white',
					backgroundColor: 'white',
					padding: '14px 36px',
					borderRadius: '32px',
				}}
			>
				{label}
			</span>
		</AbsoluteFill>
	);
};
