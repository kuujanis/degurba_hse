export type Position = number[]
export type Bbox = {minLng: number, minLat: number, maxLng: number, maxLat: number}

export interface Polygon {
    type: "Polygon";
    coordinates: Position[][];
}

/**
 * MultiPolygon geometry object.
 * https://tools.ietf.org/html/rfc7946#section-3.1.7
 */
export interface MultiPolygon {
    type: "MultiPolygon";
    coordinates: Position[][][];
}