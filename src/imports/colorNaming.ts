/**
 * Maps hue and chroma values to human-readable color names.
 * Used for auto-naming ramps based on their OKLCH color properties.
 *
 * Hue boundaries are aligned with the warmth correction algorithm:
 * - Orange (0-60°) excludes hues that receive warmth correction
 * - Yellow (60-75°) fully overlaps with the warmth correction zone, preventing muddy appearance in dark tones
 * - Green (75-150°) starts after the warmth correction window to avoid misleading names for shifted hues
 */
export function getColorName(hue: number, chroma: number): string {
  // If chroma is very low (< 0.02), it's a neutral/grayscale
  if (chroma < 0.02) {
    return 'Neutral';
  }

  // Map hue to color names (0-360 degrees)
  const hueNormalized = ((hue % 360) + 360) % 360;

  if (hueNormalized < 15 || hueNormalized >= 345) return 'Red';
  if (hueNormalized < 60) return 'Orange';
  if (hueNormalized < 75) return 'Yellow';
  if (hueNormalized < 150) return 'Green';
  if (hueNormalized < 200) return 'Cyan';
  if (hueNormalized < 260) return 'Blue';
  if (hueNormalized < 300) return 'Purple';
  return 'Magenta';
}
