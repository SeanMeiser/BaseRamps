import { formatHex, oklch, converter, displayable, toGamut, differenceCiede2000 } from 'culori';

export const toOklch = converter('oklch');
const clampToSrgb = toGamut('rgb');

export function getOklchColor(hue: number, saturation: number, lightness: number) {
  return toOklch({ mode: 'hsl', h: hue, s: saturation / 100, l: lightness / 100 });
}

/**
 * Warmth Correction (Anti-Mud Logic)
 * Prevents dark yellows from turning into muddy olive greens.
 * 
 * @param originalHue - The OKLCH hue value (0-360)
 * @param currentLightness - The OKLCH lightness value (0-1)
 * @returns The corrected hue value
 */
function applyWarmthCorrection(originalHue: number | undefined, currentLightness: number): number | undefined {
  // If hue is undefined, return as is
  if (originalHue === undefined) return originalHue;
  
  // Trigger: If hue is between 60 and 110 (Yellow/Orange) AND lightness is below 0.5
  if (originalHue >= 60 && originalHue <= 110 && currentLightness < 0.5) {
    // Action: Gradually rotate hue toward Red (lower hue value) as lightness decreases
    // Formula: correctedHue = originalHue - (25 * (0.5 - currentLightness))
    const correction = 25 * (0.5 - currentLightness);
    return originalHue - correction;
  }
  
  return originalHue;
}

export function generateOklchRamp(
  hue: number, 
  saturation: number, 
  inputLightness: number, 
  railLightnesses: number[]
): { colors: string[]; warning: boolean } {
  // Convert Input Color (HSL) to OKLCH to extract constant Chroma and Hue
  const inputColor = getOklchColor(hue, saturation, inputLightness);
  
  // Chroma Floor: If chroma is < 0.02 (effectively gray), treat as pure neutral
  // Skip warmth correction and gamut checks to prevent floating-point warnings on grayscale
  const isNeutral = !inputColor.c || inputColor.c < 0.02;
  
  // Identify the Anchor: Find which rail step is closest to the user's input lightness
  let anchorIndex = 0;
  let smallestDiff = Math.abs(railLightnesses[0] - inputLightness);
  for (let i = 1; i < railLightnesses.length; i++) {
    const diff = Math.abs(railLightnesses[i] - inputLightness);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      anchorIndex = i;
    }
  }
  
  let warningFlag = false;
  
  // Create swatches locking L to rail values, keeping C constant and applying warmth correction to H
  const colors = railLightnesses.map((l, index) => {
    const targetLightness = l / 100;
    
    // Only apply warmth correction if NOT a neutral color
    const correctedHue = isNeutral ? inputColor.h : applyWarmthCorrection(inputColor.h, targetLightness);
    
    // Calculate IdealColor: Target Lightness + User's Chroma + Warmth-Corrected Hue
    const idealColor = { 
      mode: 'oklch' as const, 
      l: targetLightness, 
      c: inputColor.c || 0, 
      h: correctedHue 
    };
    
    // Calculate RenderedColor: Apply gamut clamping to ensure displayable in sRGB
    const renderedColor = clampToSrgb(idealColor);
    
    // Validate ONLY the Anchor: Compare User's Input vs. Final System Anchor Color
    // Ignore the extremes (L95, L10, etc.) - chroma loss at extremes is expected
    if (index === anchorIndex && !isNeutral) {
      // For the anchor, compare against the user's original input color
      // This checks if the user's chosen color can be represented accurately
      const anchorIdealColor = {
        mode: 'oklch' as const,
        l: targetLightness,
        c: inputColor.c || 0,
        h: correctedHue
      };
      
      const deltaE = differenceCiede2000()(anchorIdealColor, renderedColor);
      if (deltaE > 2.5) {
        warningFlag = true;
      }
    }
    
    return formatHex(renderedColor);
  });
  
  return { colors, warning: warningFlag };
}