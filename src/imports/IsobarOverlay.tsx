import { useEffect, useRef } from 'react';
import { converter, inGamut } from 'culori';

const toOklch = converter('oklch');
const toRgb = converter('rgb');
const isDisplayable = inGamut('rgb');

/**
 * Warmth Correction (Anti-Mud Logic)
 * This matches the logic in color-engine.ts
 */
function applyWarmthCorrection(originalHue: number | undefined, currentLightness: number): number | undefined {
  if (originalHue === undefined) return originalHue;
  
  // Trigger: If hue is between 60 and 110 (Yellow/Orange) AND lightness is below 0.5
  if (originalHue >= 60 && originalHue <= 110 && currentLightness < 0.5) {
    // Action: Gradually rotate hue toward Red (lower hue value) as lightness decreases
    const correction = 25 * (0.5 - currentLightness);
    return originalHue - correction;
  }
  
  return originalHue;
}

interface IsobarOverlayProps {
  currentHue: number; // 0-360
  targetLightness: number; // 0-1 in OKLCH space
  width: number;
  height: number;
}

/**
 * Binary search to find the HSV Value (brightness) that produces
 * a specific OKLCH lightness for a given hue and saturation.
 */
function findValueForTargetLightness(
  hue: number,
  saturation: number,
  targetLightness: number
): number | null {
  let low = 0;
  let high = 1;
  const tolerance = 0.001;
  const maxIterations = 20;
  
  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    
    // Convert HSV to OKLCH
    const hsvColor = { mode: 'hsv' as const, h: hue, s: saturation, v: mid };
    const oklchColor = toOklch(hsvColor);
    
    if (!oklchColor || oklchColor.l === undefined) {
      return null;
    }
    
    const currentLightness = oklchColor.l;
    const diff = currentLightness - targetLightness;
    
    if (Math.abs(diff) < tolerance) {
      return mid;
    }
    
    if (currentLightness < targetLightness) {
      low = mid;
    } else {
      high = mid;
    }
  }
  
  // Return the final approximation
  const mid = (low + high) / 2;
  return mid;
}

export default function IsobarOverlay({ 
  currentHue, 
  targetLightness, 
  width, 
  height 
}: IsobarOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Create two separate paths for safe (in-gamut) and warning (out-of-gamut) zones
    const safePath = new Path2D();
    const warningPath = new Path2D();
    
    let currentPath: 'safe' | 'warning' | null = null;
    const step = 2; // Sample every 2 pixels for performance
    
    // Iterate across X-axis (Saturation)
    for (let x = 0; x <= width; x += step) {
      // Calculate normalized saturation (0-1)
      const saturation = x / width;
      
      // Find the Y coordinate (brightness/value) where the color matches targetLightness
      const value = findValueForTargetLightness(currentHue, saturation, targetLightness);
      
      if (value !== null && value >= 0 && value <= 1) {
        // Convert value to Y coordinate (inverted: top = high value, bottom = low value)
        const y = height * (1 - value);
        
        // Reconstruct the full color at this point in OKLCH
        const hsvColor = { mode: 'hsv' as const, h: currentHue, s: saturation, v: value };
        const oklchColor = toOklch(hsvColor);
        
        // Strict Boolean Check: Test if the warmth-corrected candidate is in sRGB gamut
        let isInGamut = true;
        if (oklchColor && oklchColor.l !== undefined && oklchColor.c !== undefined && oklchColor.h !== undefined) {
          // Apply warmth correction to the hue (same logic as color-engine.ts)
          const correctedHue = applyWarmthCorrection(oklchColor.h, oklchColor.l);
          
          // Construct the candidate color with corrected hue but original chroma
          const candidate = {
            mode: 'oklch' as const,
            l: oklchColor.l,
            c: oklchColor.c,
            h: correctedHue
          };
          
          // The Check: Is this warmth-corrected candidate displayable in sRGB?
          const safe = isDisplayable(candidate);
          isInGamut = safe;
        }
        
        // Determine which path to use
        const targetPath = isInGamut ? 'safe' : 'warning';
        
        if (currentPath === null) {
          // First point - start both paths
          safePath.moveTo(x, y);
          warningPath.moveTo(x, y);
          currentPath = targetPath;
        } else if (currentPath === targetPath) {
          // Continue on the current path
          if (targetPath === 'safe') {
            safePath.lineTo(x, y);
            warningPath.moveTo(x, y); // Keep warning path cursor in sync
          } else {
            warningPath.lineTo(x, y);
            safePath.moveTo(x, y); // Keep safe path cursor in sync
          }
        } else {
          // Switching paths - connect them smoothly
          if (targetPath === 'safe') {
            warningPath.lineTo(x, y); // End the warning segment
            safePath.moveTo(x, y); // Start the safe segment
          } else {
            safePath.lineTo(x, y); // End the safe segment
            warningPath.moveTo(x, y); // Start the warning segment
          }
          currentPath = targetPath;
        }
      } else {
        // Can't find a matching value - reset the paths
        currentPath = null;
      }
    }
    
    // Render the safe path (solid white)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([]); // Solid line
    ctx.stroke(safePath);
    
    // Render the warning path (dashed white, faded)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([4, 4]); // Dashed line
    ctx.stroke(warningPath);
    
  }, [currentHue, targetLightness, width, height]);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ 
        width: `${width}px`, 
        height: `${height}px` 
      }}
    />
  );
}