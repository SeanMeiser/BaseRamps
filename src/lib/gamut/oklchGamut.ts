import { converter } from 'culori';

const toRgb = converter('rgb');

/**
 * Check if an OKLCH color is displayable in sRGB
 * Returns true if all RGB channels are in [0, 1]
 */
export function isDisplayable(l: number, c: number, h: number): boolean {
    const rgb = toRgb({ mode: 'oklch', l, c, h });

    if (!rgb || rgb.r === undefined || rgb.g === undefined || rgb.b === undefined) {
        return false;
    }

    const tolerance = 0.0001; // Small tolerance for floating point errors
    return (
        rgb.r >= -tolerance && rgb.r <= 1 + tolerance &&
        rgb.g >= -tolerance && rgb.g <= 1 + tolerance &&
        rgb.b >= -tolerance && rgb.b <= 1 + tolerance
    );
}

/**
 * Find the maximum displayable chroma for a given OKLCH (L, H) pair
 * Uses binary search with sRGB conversion to find the gamut edge
 */
export function findMaxChroma(lightness: number, hue: number): number {
    // Edge cases: pure black and pure white have no chroma
    if (lightness <= 0.001 || lightness >= 0.999) {
        return 0;
    }

    let low = 0;
    let high = 0.5; // Maximum theoretical chroma (well beyond sRGB)
    const tolerance = 0.0001;
    const maxIterations = 20;

    for (let i = 0; i < maxIterations; i++) {
        const mid = (low + high) / 2;

        if (isDisplayable(lightness, mid, hue)) {
            low = mid; // This chroma works, try higher
        } else {
            high = mid; // This chroma is too high, try lower
        }

        if (high - low < tolerance) {
            break;
        }
    }

    return low;
}

/**
 * Calculate gamut boundary points for a given hue
 * Returns array of {l, c} pairs representing the displayable region
 * Samples at multiple lightness values from 0 to 1
 */
export function calculateGamutBoundary(hue: number, samples: number = 50): Array<{ l: number; c: number }> {
    const boundary: Array<{ l: number; c: number }> = [];

    for (let i = 0; i <= samples; i++) {
        const l = i / samples;
        const c = findMaxChroma(l, hue);
        boundary.push({ l, c });
    }

    return boundary;
}

/**
 * Cache for gamut boundaries to avoid recalculation
 * Key: hue (rounded to nearest degree)
 * Value: boundary points
 */
const boundaryCache = new Map<number, Array<{ l: number; c: number }>>();

/**
 * Get cached gamut boundary or calculate if not cached
 */
export function getGamutBoundary(hue: number, samples: number = 50): Array<{ l: number; c: number }> {
    const roundedHue = Math.round(hue);

    if (!boundaryCache.has(roundedHue)) {
        const boundary = calculateGamutBoundary(roundedHue, samples);
        boundaryCache.set(roundedHue, boundary);
    }

    return boundaryCache.get(roundedHue)!;
}

/**
 * Clear the boundary cache (useful if memory becomes an issue)
 */
export function clearBoundaryCache(): void {
    boundaryCache.clear();
}
