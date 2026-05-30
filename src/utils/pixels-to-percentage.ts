/**
 * Converts a pixel value to a percentage relative to a given area.
 * @param area - The total area in pixels to calculate percentage against
 * @param pixels - The pixel value to convert to percentage
 * @returns The percentage value (0-100) that the pixels represent of the total area
 */
export const pixelsToPercentage = (area: number, pixels: number) => (area === 0 ? 0 : (pixels / area) * 100);
