import { useRef, useEffect, useCallback, useState, useMemo, type PointerEvent } from 'react';
import { converter } from 'culori';
import { getGamutBoundary } from '../lib/gamut/oklchGamut';

const toRgb = converter('rgb');

interface OKLrCHPickerProps {
    hue: number;              // Current hue (0-360)
    lightness: number;        // Target lightness from system (0-1 OKLCH)
    chroma: number;           // Current chroma (0-0.4)
    railLightnesses: number[]; // Discrete lightness steps from system (HSL 0-100)
    onChange: (c: number, l: number) => void;
}

export default function OKLrCHPicker({ hue, lightness, chroma, railLightnesses, onChange }: OKLrCHPickerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    // Use a ref for the cached gradient to persist it across renders without triggering re-renders
    const gradientCacheRef = useRef<HTMLCanvasElement | null>(null);
    const isDragging = useRef(false);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Get gamut boundary for current hue
    // Memoize to avoid re-calculation on every render frame
    const boundary = useMemo(() => getGamutBoundary(hue, 50), [hue]);

    // Use a fixed maximum chroma for consistent scaling across all hues
    // This prevents the handle from jumping when changing hues if chroma stays the same
    // 0.37 is chosen as it covers most of the sRGB gamut's chroma range
    const FIXED_MAX_CHROMA = 0.37;

    // Find the actual max chroma for this hue (for gamut checking)
    const actualMaxChroma = useMemo(() => Math.max(...boundary.map((p: { c: number }) => p.c), 0.001), [boundary]);

    // Convert OKLCH coordinates to canvas coordinates (using fixed scale)
    const toCanvasCoords = useCallback((l: number, c: number) => {
        const { width, height } = dimensions;
        const x = (c / FIXED_MAX_CHROMA) * width;
        const y = (1 - l) * height; // Invert Y so high L is at top
        return { x, y };
    }, [dimensions]);

    // Convert canvas coordinates to OKLCH coordinates (using fixed scale)
    const fromCanvasCoords = useCallback((x: number, y: number) => {
        const { width, height } = dimensions;
        const c = (x / width) * FIXED_MAX_CHROMA;
        const l = 1 - (y / height); // Invert Y
        return { l, c };
    }, [dimensions]);

    // Update gradient cache when hue or dimensions change
    useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) return;

        // Use a fixed resolution multiplier for the cache to balance quality and performance
        // 1.5x gives good quality without the full cost of 2x-3x DPR on Retina displays
        const CACHE_RESOLUTION_MULTIPLIER = 1.5;
        const width = Math.floor(dimensions.width * CACHE_RESOLUTION_MULTIPLIER);
        const height = Math.floor(dimensions.height * CACHE_RESOLUTION_MULTIPLIER);

        if (!gradientCacheRef.current) {
            gradientCacheRef.current = document.createElement('canvas');
        }

        const cacheCanvas = gradientCacheRef.current;
        // Only resize if dimensions changed
        if (cacheCanvas.width !== width || cacheCanvas.height !== height) {
            cacheCanvas.width = width;
            cacheCanvas.height = height;
        }

        const ctx = cacheCanvas.getContext('2d', { willReadFrequently: false });
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // We render pixels fully opaque then mask, so background doesn't matter initially.

        // Create ImageData for pixel manipulation
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        for (let y = 0; y < height; y++) {
            // Map y back to 0-1 range (inverted)
            // y=0 -> L=1, y=height -> L=0
            const l = 1 - (y / height);

            for (let x = 0; x < width; x++) {
                const c = (x / width) * FIXED_MAX_CHROMA;

                // Convert to RGB
                const rgb = toRgb({ mode: 'oklch', l, c, h: hue });

                const index = (y * width + x) * 4;

                if (rgb && rgb.r !== undefined && rgb.g !== undefined && rgb.b !== undefined) {
                    data[index] = Math.round(Math.max(0, Math.min(255, rgb.r * 255)));
                    data[index + 1] = Math.round(Math.max(0, Math.min(255, rgb.g * 255)));
                    data[index + 2] = Math.round(Math.max(0, Math.min(255, rgb.b * 255)));
                    data[index + 3] = 255; // Alpha
                } else {
                    // Fallback for weird conversion failures?
                    // Just make it white/gray or transparent
                    data[index] = 224;
                    data[index + 1] = 224;
                    data[index + 2] = 224;
                    data[index + 3] = 255;
                }
            }
        }

        // Put the colorful rectangle
        ctx.putImageData(imageData, 0, 0);

        // Apply gamut clipping
        ctx.globalCompositeOperation = 'destination-in';
        ctx.beginPath();
        boundary.forEach((point: { l: number, c: number }, i: number) => {
            // Scale points to physical pixels
            const px = (point.c / FIXED_MAX_CHROMA) * width;
            const py = (1 - point.l) * height;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fillStyle = '#000';
        ctx.fill();

        // Draw background for out-of-gamut areas
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(0, 0, width, height);

        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';

    }, [hue, dimensions, boundary]);

    // Main Render Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const width = dimensions.width;
        const height = dimensions.height;

        // Handle High DPI scaling
        if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
        }
        // Always set style for logical size
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // Reset transform and scale to DPR in one operation to prevent accumulation
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // 1. Draw Cached Gradient
        if (gradientCacheRef.current) {
            ctx.drawImage(gradientCacheRef.current, 0, 0, width, height);
        }

        // 2. Draw Gamut Boundary Outline
        ctx.beginPath();
        boundary.forEach((point: { l: number, c: number }, i: number) => {
            const { x, y } = toCanvasCoords(point.l, point.c);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 3. Draw Lightness Lock (Rail) Indicator
        const lockY = (1 - lightness) * height;
        ctx.beginPath();
        ctx.moveTo(0, lockY);
        ctx.lineTo(width, lockY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // 4. Draw Handle
        const handlePos = toCanvasCoords(lightness, chroma);

        // Outer ring
        ctx.beginPath();
        ctx.arc(handlePos.x, handlePos.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner circle with current color
        const currentRgb = toRgb({ mode: 'oklch', l: lightness, c: chroma, h: hue });
        if (currentRgb && currentRgb.r !== undefined) {
            const r = Math.round(Math.max(0, Math.min(255, currentRgb.r * 255)));
            const g = Math.round(Math.max(0, Math.min(255, currentRgb.g * 255)));
            const b = Math.round(Math.max(0, Math.min(255, currentRgb.b * 255)));

            ctx.beginPath();
            ctx.arc(handlePos.x, handlePos.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fill();
        }

    }, [hue, lightness, chroma, dimensions, boundary, toCanvasCoords]);

    // Handle pointer events
    const handleMove = useCallback((e: PointerEvent | globalThis.PointerEvent) => {
        if (!isDragging.current || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

        // Derive both chroma and lightness from pointer position
        const { c, l } = fromCanvasCoords(x, y);

        // Clamp chroma to valid range
        const clampedC = Math.max(0, Math.min(FIXED_MAX_CHROMA, c));

        // Snap lightness to nearest rail value
        // Convert railLightnesses (HSL 0-100) to OKLCH (0-1) for comparison
        const railsInOklch = railLightnesses.map(hslL => hslL / 100);

        // Find nearest rail lightness
        let nearestL = railsInOklch[0];
        let minDiff = Math.abs(l - nearestL);

        for (const railL of railsInOklch) {
            const diff = Math.abs(l - railL);
            if (diff < minDiff) {
                minDiff = diff;
                nearestL = railL;
            }
        }

        onChange(clampedC, nearestL);
    }, [fromCanvasCoords, railLightnesses, onChange]);

    const handleUp = useCallback(() => {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
    }, [handleMove]);

    const handleDown = (e: PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        isDragging.current = true;
        document.body.style.cursor = 'move';
        document.body.style.userSelect = 'none';
        handleMove(e.nativeEvent);
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
    };

    // Track container dimensions
    useEffect(() => {
        if (containerRef.current) {
            const updateDimensions = () => {
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    setDimensions(prev => {
                        if (prev.width === rect.width && prev.height === rect.height) return prev;
                        return { width: rect.width, height: rect.height };
                    });
                }
            };

            updateDimensions();

            const observer = new ResizeObserver(updateDimensions);
            observer.observe(containerRef.current);
            return () => observer.disconnect();
        }
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-square select-none touch-none cursor-pointer"
            onPointerDown={handleDown}
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
            // No inline width/height here, handled by ref
            />
            <div aria-hidden="true" className="absolute border border-[#c4c4c4] border-solid inset-0 pointer-events-none" />
        </div>
    );
}
