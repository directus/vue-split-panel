/**
 * Converts a percentage value to pixels based on a given area.
 * @param area - The total area in pixels
 * @param percentage - The percentage value to convert (0-100)
 * @returns The pixel value corresponding to the percentage of the area
 */
export const percentageToPixels = (area: number, percentage: number) => area * (percentage / 100);
