import { describe, expect, it } from 'vite-plus/test';
import { closestNumber } from './closest-number';

describe('closestNumber', () => {
	it('returns undefined for empty array', () => {
		expect(closestNumber([], 10)).toBeUndefined();
	});

	it('returns the only element for single-item array', () => {
		expect(closestNumber([5], 10)).toBe(5);
	});

	it('finds the exact match when present', () => {
		expect(closestNumber([1, 5, 10, 15], 10)).toBe(10);
	});

	it('returns closest lower value when tie broken by smaller number', () => {
		// distance to 9: |8-9|=1, |10-9|=1 => choose 8
		expect(closestNumber([8, 10], 9)).toBe(8);
	});

	it('works with negative numbers', () => {
		expect(closestNumber([-10, -3, 2, 5], -4)).toBe(-3);
	});

	it('handles large numbers', () => {
		expect(closestNumber([1e9, 1e12], 5e11)).toBe(1e9); // distances: 4.99e11 vs 5e11
	});

	it('ignores NaN and Infinity values', () => {
		// Only finite numbers 5 and 20 considered => closest to 12 is 5 (distance 7 vs 8)
		expect(closestNumber([Number.NaN, 5, Infinity, -Infinity, 20], 12)).toBe(5);
	});

	it('returns undefined if all values are non-finite', () => {
		expect(closestNumber([Number.NaN, Infinity, -Infinity], 3)).toBeUndefined();
	});

	it('handles target being negative infinity', () => {
		expect(closestNumber([-100, 0, 100], Number.NEGATIVE_INFINITY)).toBe(-100);
	});

	it('handles target being positive infinity', () => {
		expect(closestNumber([-100, 0, 100], Number.POSITIVE_INFINITY)).toBe(100);
	});
});
