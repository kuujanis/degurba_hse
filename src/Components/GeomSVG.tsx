import type { MapGeoJSONFeature } from "maplibre-gl";
import type { Polygon } from "../types";
import { geoToSVG, getClassPaint } from "../utils";

interface SVGProps {
    selectedCell: MapGeoJSONFeature|null;
    multiClass: boolean;
    height: number;
    width: number;
}

export const GeomSVG = ({selectedCell,multiClass, height, width}:SVGProps) => {
    if (!selectedCell) return
    const polygonGeom = selectedCell.geometry
    if (!polygonGeom) return;
    const polygon = polygonGeom as  Polygon //type assertion because multipolygons are really just polygons
    const flatCoords = polygon.coordinates.flat() 
    const svgCoords = geoToSVG(flatCoords,width,height)
    const points = svgCoords.map(([x, y]) => `${x},${y}`).join(' ');
    const l_class:string = multiClass ? selectedCell.properties.l2_class : selectedCell.properties.l1_class
    const fill = getClassPaint(l_class)
    return (
        <svg width={width} height={height}>
            <polygon
                points={points}
                fill={fill}
            />
        </svg>
        
    );
}