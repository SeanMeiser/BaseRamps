import { useRef, useEffect, useCallback, useState } from 'react';
import { converter } from 'culori';
import { getGamutBoundary } from '../lib/gamut/oklchGamut';

const toRgb = converter('rgb');
const toOklch = converter('oklch');

interface OKLrCHPickerProps {
    hue: number;              // Current hue (0-360)
    lightness: number;        // Target lightness from system (0-1 OKLCH)
    chroma: number;           // Current chroma (0-0.4)
    onChange: (c: number, l: number) => void;
}

export default function OKLrCHPicker({ hue, lightness, chroma, onChange }: OKLrCHPickerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Get gamut boundary for current hue
    const boundary = getGamutBoundary(hue, 50);

    // Find max chroma across all lightness values for scaling
    const maxChroma = Math.max(...boundary.map(p => p.c), 0.001);

    // Convert OKLCH coordinates to canvas coordinates
    const toCanvasCoords = useCallback((l: number, c: number) => {
        const { width, height } = dimensions;
        const x = (c / maxChroma) * width;
        const y = (1 - l) * height; // Invert Y so high L is at top
        return { x, y };
    }, [dimensions, maxChroma]);

    // Convert canvas coordinates to OKLCH coordinates
    const fromCanvasCoords = useCallback((x: number, y: number) => {
        const { width, height } = dimensions;
        const c = (x / width) * maxChroma;
        const l = 1 - (y / height); // Invert Y
        return { l, c };
    }, [dimensions, maxChroma]);

    // Render the picker
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = dimensions;
        canvas.width = width;
        canvas.height = height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw gray background (out-of-gamut area)
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(0, 0, width, height);

        // Create clipping path from gamut boundary
        ctx.beginPath();
        boundary.forEach((point, i) => {
            const { x, y } = toCanvasCoords(point.l, point.c);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();
        ctx.save();
        ctx.clip();

        // Draw color gradient within gamut
        // Sample colors across the clipped region
        const sampleSize = 4; // Pixels per sample
        for (let py = 0; py < height; py += sampleSize) {
            for (let px = 0; px < width; px += sampleSize) {
                const { l, c } = fromCanvasCoords(px + sampleSize / 2, py + sampleSize / 2);

                // Convert to RGB for display
                const rgb = toRgb({ mode: 'oklch', l, c, h: hue });
                if (rgb && rgb.r !== undefined && rgb.g !== undefined && rgb.b !== undefined) {
                    const r = Math.round(Math.max(0, Math.min(255, rgb.r * 255)));
                    const g = Math.round(Math.max(0, Math.min(255, rgb.g * 255)));
                    const b = Math.round(Math.max(0, Math.min(255, rgb.b * 255)));

                    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    ctx.fillRect(px, py, sampleSize, sampleSize);
                }
            }
        }

        ctx.restore();

        // Draw gamut boundary outline
        ctx.beginPath();
        boundary.forEach((point, i) => {
            const { x, y } = toCanvasCoords(point.l, point.c);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw lightness lock indicator (horizontal line)
        const lockY = (1 - lightness) * height;
        ctx.beginPath();
        ctx.moveTo(0, lockY);
        ctx.lineTo(width, lockY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw handle
        const handlePos = toCanvasCoords(lightness, chroma);
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

    }, [hue, lightness, chroma, dimensions, boundary, toCanvasCoords, fromCanvasCoords, maxChroma]);

    // Handle pointer events
    const handleMove = useCallback((e: PointerEvent) => {
        if (!isDragging.current || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(dimensions.width, e.clientX - rect.left));
        // Don't use y - lightness is locked!

        // Only derive chroma from x position
        const { c } = fromCanvasCoords(x, 0); // Y doesn't matter, we only care about X for chroma

        // Clamp chroma to valid range
        const clampedC = Math.max(0, Math.min(maxChroma, c));

        // Keep lightness locked to the prop value
        onChange(clampedC, lightness);
    }, [dimensions, fromCanvasCoords, maxChroma, lightness, onChange]);

    const handleUp = useCallback(() => {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
    }, [handleMove]);

    const handleDown = (e: React.PointerEvent) => {
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
                    setDimensions({ width: rect.width, height: rect.height });
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
            />
            <div aria-hidden="true" className="absolute border border-[#c4c4c4] border-solid inset-0 pointer-events-none" />
        </div>
    );
}
