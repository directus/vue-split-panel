/**
 * Returns the number from an array that is closest to the provided value.
 *
 * Tie breaking:
 * - For finite target values: if two numbers are equally close, the smaller numeric value is returned (stable + predictable)
 * - For target = +Infinity: the largest candidate wins (intuitive 'towards' the target)
 * - For target = -Infinity: the smallest candidate wins
 *
 * Non-finite (NaN / ±Infinity) entries in the candidate list are ignored. If, after filtering, no numbers remain, `undefined` is returned.
 *
 * @param numbers - The list of candidate numbers
 * @param value - The target value to compare against
 * @returns The closest number from the list, or `undefined` if the list is empty or only contained non-finite values
 */
export const closestNumber = (numbers: readonly number[], value: number): number | undefined => {
	let closest: number | undefined;
	let smallestDiff = Number.POSITIVE_INFINITY;

	for (const n of numbers) {
		if (!Number.isFinite(n)) continue; // ignore NaN / Infinity
		const diff = Math.abs(n - value);

		if (diff < smallestDiff) {
			smallestDiff = diff;
			closest = n;
			continue;
		}

		if (diff === smallestDiff && closest !== undefined) {
			if (value === Number.POSITIVE_INFINITY) {
				if (n > closest) closest = n;
			}
			else if (value === Number.NEGATIVE_INFINITY) {
				if (n < closest) closest = n;
			}
			else if (n < closest) {
				closest = n; // finite target: choose smaller
			}
		}

		if (closest === undefined) {
			closest = n;
			smallestDiff = diff;
		}
	}

	return closest;
};
