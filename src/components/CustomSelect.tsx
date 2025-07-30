"use client";

import React from "react";
import { WidgetProps } from "@rjsf/utils";

const formatEnumLabel = (value: string, fieldName?: string): string => {
  const labelMappings: Record<string, Record<string, string>> = {
    tileStyle: {
      watercolor: "Watercolor (Artistic)",
      dark: "Dark (StadiaMaps)",
      darkMatter: "Dark Matter (CartoDB)",
      positron: "Positron (CartoDB)",
      toner: "Toner (High Contrast B&W)",
      terrain: "Terrain (Elevation)",
      satellite: "Satellite (ArcGIS)",
      osm: "OpenStreetMap",
      osmBright: "OSM Bright (StadiaMaps)",
    },
    routeMethod: {
      straight: "Straight Line",
      curved: "Curved (Bezier)",
      osm: "Road Routing (OSRM)",
      overpass: "Railway Tracks (OpenStreetMap)",
      railway: "Railway (Simplified)",
      openrailway: "OpenRailway API",
    },
  };

  if (fieldName && labelMappings[fieldName] && labelMappings[fieldName][value]) {
    return labelMappings[fieldName][value];
  }

  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

export const CustomSelectWidget: React.FC<WidgetProps> = ({
  id,
  options,
  value,
  disabled,
  readonly,
  onChange,
  label,
  schema,
  required,
  name,
}) => {
  const enumOptions = options.enumOptions || [];
  const placeholder = options.placeholder || `Select ${label}`;
  const fieldName = name || id.split("_").pop();

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={id}
        value={value || ""}
        disabled={disabled || readonly}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {enumOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {formatEnumLabel(option.value as string, fieldName)}
          </option>
        ))}
      </select>
      {schema.description && (
        <p className="text-xs text-gray-500">{schema.description}</p>
      )}
    </div>
  );
};