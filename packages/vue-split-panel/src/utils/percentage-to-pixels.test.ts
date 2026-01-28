import { describe, expect, it } from 'vite-plus/test';
import { percentageToPixels } from './percentage-to-pixels';

describe('percentageToPixels', () => {
	it('returns 0 when percentage is 0', () => {
		expect(percentageToPixels(800, 0)).toBe(0);
	});

	it('returns full area when percentage is 100', () => {
		expect(percentageToPixels(800, 100)).toBe(800);
	});

	it('calculates common percentages correctly', () => {
		expect(percentageToPixels(800, 50)).toBe(400);
		expect(percentageToPixels(1000, 25)).toBe(250);
	});

	it('handles decimal percentages', () => {
		// 33.3333% of 900 is approximately 300
		expect(percentageToPixels(900, 33.3333)).toBeCloseTo(300, 3);
		// 10.5% of 200 is exactly 21
		expect(percentageToPixels(200, 10.5)).toBe(21);
	});

	it('handles very large areas without precision issues (within tolerance)', () => {
		expect(percentageToPixels(1e9, 0.1)).toBeCloseTo(1e6, 0);
	});

	it('does not clamp out-of-range percentages (documented as 0-100 but mathematically allowed)', () => {
		expect(percentageToPixels(500, -10)).toBe(-50);
		expect(percentageToPixels(500, 150)).toBe(750);
	});
});
