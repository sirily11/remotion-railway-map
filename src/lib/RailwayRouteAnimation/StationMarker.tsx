import React from 'react';
import { AbsoluteFill } from 'remotion';
import { loadFont, fontFamily } from '@remotion/google-fonts/Lora';
import { LABEL_FONT_SIZE, LABEL_MARGIN_TOP, MARKER_SIZE } from './constants';

loadFont();

export type LabelPosition = 'above' | 'below';

interface StationMarkerProps {
  name: string;
  labelPosition: LabelPosition;
  opacity?: number;
  scale?: number;
}

export const StationMarker: React.FC<StationMarkerProps> = ({
  name,
  labelPosition,
  opacity = 1,
  scale = 1,
}) => {
  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* Station Point */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: MARKER_SIZE,
            height: MARKER_SIZE,
            borderRadius: '50%',
            backgroundColor: '#0066ff',
            border: '6px solid white',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
          }}
        />
      </AbsoluteFill>
      
      {/* Station Label */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: labelPosition === 'above' ? -LABEL_MARGIN_TOP : LABEL_MARGIN_TOP,
          fontSize: LABEL_FONT_SIZE,
          fontWeight: 'bold',
          fontFamily,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            textShadow: '0 0 30px white',
            backgroundColor: 'white',
            padding: '14px 36px',
            borderRadius: '32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          {name}
        </span>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};