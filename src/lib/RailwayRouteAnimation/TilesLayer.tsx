// From: https://github.com/gaswelder/react-slippy-map/blob/master/src/TilesLayer.js

import React from 'react';
import {Img} from 'remotion';
import {getXFromLongitude, getYFromLatitude, TILE_SIZE} from './utils/mercator';
import {Point} from './utils/geo-utils';

export type Area = {
	leftTop: Point;
	rightBottom: Point;
};

// Different tile server styles
export const TILE_STYLES = {
	watercolor: 'https://watercolormaps.collection.cooperhewitt.org/tile/watercolor',
	dark: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark',
	darkMatter: 'https://a.basemaps.cartocdn.com/dark_all',
	positron: 'https://a.basemaps.cartocdn.com/light_all',
	toner: 'https://tiles.stadiamaps.com/tiles/stamen_toner',
	terrain: 'https://tiles.stadiamaps.com/tiles/stamen_terrain',
	satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile',
	osm: 'https://tile.openstreetmap.org',
	osmBright: 'https://tiles.stadiamaps.com/tiles/osm_bright',
};

export type TileStyle = keyof typeof TILE_STYLES;

type Props = {
	offset: {x: number; y: number};
	zoom: number;
	area: Area;
	style?: TileStyle;
};

type TileRender = {
	style: React.CSSProperties;
	url: string;
};

const calcTiles = ({area, offset, zoom, style = 'dark'}: Props) => {
	const baseUrl = TILE_STYLES[style];
	// We are given a map area specified as latitude and longitude ranges.

	// To render this area we have to get the corresponding projection area as x
	// and y coordinate ranges.
	const x1 = getXFromLongitude(area.leftTop.longitude, zoom);
	const numberOfXTilesInTheWorld = getXFromLongitude(180, zoom) / TILE_SIZE;
	const x2 = getXFromLongitude(area.rightBottom.longitude, zoom);

	const y1 = getYFromLatitude(area.leftTop.latitude, zoom);
	const y2 = getYFromLatitude(area.rightBottom.latitude, zoom);

	// The tile indices are then simply calculated from proportions.
	const i1 = Math.floor(x1 / TILE_SIZE);
	const i2 = Math.floor(x2 / TILE_SIZE);
	const j1 = Math.floor(y1 / TILE_SIZE);
	const j2 = Math.floor(y2 / TILE_SIZE);

	const tiles: TileRender[] = [];
	for (let i = i1; i <= i2; i++) {
		for (let j = j1; j <= j2; j++) {
			const x = i < 0 ? i + numberOfXTilesInTheWorld : i;
			let url: string;
			
			// Different tile servers have different URL formats
			if (style === 'satellite') {
				// ArcGIS format: /z/y/x
				url = `${baseUrl}/${zoom}/${j}/${x}`;
			} else if (style === 'osm') {
				// OSM format: /z/x/y.png
				url = `${baseUrl}/${zoom}/${x}/${j}.png`;
			} else if (style === 'watercolor') {
				// Watercolor format: /z/x/y.jpg
				url = `${baseUrl}/${zoom}/${x}/${j}.jpg`;
			} else {
				// Most other formats: /z/x/y.png
				url = `${baseUrl}/${zoom}/${x}/${j}.png`;
			}
			const tileStyle: React.CSSProperties = {
				position: 'absolute',
				left: i * TILE_SIZE - offset.x,
				top: j * TILE_SIZE - offset.y,
				width: TILE_SIZE,
				height: TILE_SIZE,
				backgroundColor: '#e6ec88',
			};

			const render: TileRender = {style: tileStyle, url};

			tiles.push(render);
		}
	}

	return tiles;
};

export const TilesLayer: React.FC<Props> = ({offset, zoom, area, style = 'dark'}) => {
	const tiles = calcTiles({offset, zoom, area, style});

	// The parent component puts the rendered result in a coordinate system
	// shifted to keep the relative coordinates of the tiles low. The offset is
	// given as a property here.
	const containerStyle: React.CSSProperties = {position: 'relative'};

	return (
		<div className="tiles-container" style={containerStyle}>
			{tiles.map((t) => {
				return <Img key={t.url} src={t.url} style={t.style} />;
			})}
		</div>
	);
};
