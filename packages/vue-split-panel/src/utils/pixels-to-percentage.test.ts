import { describe, expect, it } from 'vite-plus/test';
import { pixelsToPercentage } from './pixels-to-percentage';

describe('pixelsToPercentage', () => {
	it('returns 0 when pixels is 0', () => {
		expect(pixelsToPercentage(800, 0)).toBe(0);
	});

	it('returns 100 when pixels equals area', () => {
		expect(pixelsToPercentage(800, 800)).toBe(100);
	});

	it('calculates common percentages correctly', () => {
		expect(pixelsToPercentage(800, 400)).toBe(50);
		expect(pixelsToPercentage(1000, 250)).toBe(25);
	});

	it('handles decimal pixel values', () => {
		expect(pixelsToPercentage(200, 10.5)).toBe(5.25);
		expect(pixelsToPercentage(900, 300)).toBeCloseTo(33.333, 3);
	});

	it('handles very large areas without precision issues (within tolerance)', () => {
		expect(pixelsToPercentage(1e9, 1e6)).toBeCloseTo(0.1, 6);
	});

	it('does not clamp out-of-range values (negative or > 100%)', () => {
		expect(pixelsToPercentage(500, -50)).toBe(-10);
		expect(pixelsToPercentage(500, 750)).toBe(150);
	});
});
