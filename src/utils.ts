import type { Bbox, Position } from "./types";

export function getBBox(coords: Position[]): Bbox {
  if (coords.length === 0) {
    throw new Error('Coordinate array cannot be empty');
  }

  let minLng = coords[0][0];
  let maxLng = coords[0][0];
  let minLat = coords[0][1];
  let maxLat = coords[0][1];

  for (const [lng, lat] of coords) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  return {minLng: minLng, minLat: minLat, maxLng: maxLng, maxLat:maxLat};
}
export function geoToSVG(coordArr:Position[], width=50, height=50) {
    const bbox = getBBox(coordArr)
    const {minLng,minLat,maxLng,maxLat} = bbox
  return coordArr.map(([lng, lat]) => {
    // Normalize to 0-1 range
    const xNorm = (lng - minLng) / (maxLng - minLng);
    const yNorm = (lat - minLat) / (maxLat - minLat);
    
    // Convert to SVG coordinates (SVG Y axis is top-down)
    const x = xNorm * width;
    const y = height - (yNorm * height); // Invert Y axis
    
    return [x, y];
  });
}
export const CLASS_DICT:{[name:string]:string} = {
    'city': '#fe0000',
    'town and semi-dense area':'#ffcc00',
    'rural area':'#69b972',
    'dense town':'#742602',
    'semi-dense town':'#a87001',
    'suburban area or peri-urban area':'#ffff00',
    'village':'#385624',
    'dispersed rural area':'#aacd65',
    'very dispersed rural area':'#cdf570',

}
export const getClassPaint = (l_class:string) => {
    return CLASS_DICT[l_class] ?? 'grey'
}
export const spacePopNumber = (num:string|number):string => {
      // Convert to string if it's a number
  const str = typeof num === 'number' ? num.toString() : num;
  
  // Split into integer and decimal parts
  const parts = str.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? parts[1] : '';
  
  // Add spaces to the integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  // Combine with decimal part if it exists
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger
}