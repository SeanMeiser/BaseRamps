import { useState, useRef, useEffect, useCallback } from "react";
import svgPaths from "./svg-6ygof4qbak";
import svgPathsK from "./svg-kkxrrzwln3";
import IsobarOverlay from "./IsobarOverlay";
import OKLrCHPicker from "./OKLrCHPicker";
import { converter } from 'culori';
import { generateOklchRamp } from './color-engine';

const toOklch = converter('oklch');

type PaletteData = {
  id: string;
  name: string;
  hue: number;
  saturation: number;
  lightness: number;
  opacity: number;
};

type Curve = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

// Color conversion helpers
function hslToHsv(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const v = s * Math.min(l, 1 - l) + l;
  const s_hsv = v ? 2 - (2 * l) / v : 0;
  return { h, s: s_hsv * 100, v: v * 100 };
}

function hsvToHsl(h: number, s: number, v: number) {
  s /= 100;
  v /= 100;
  const l = v - (v * s) / 2;
  const m = Math.min(l, 1 - l);
  const s_hsl = m ? (v - l) / m : 0;
  return { h, s: s_hsl * 100, l: l * 100 };
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

function blendWithWhite(r: number, g: number, b: number, opacity: number): [number, number, number] {
  const alpha = opacity / 100;
  const blend = (c: number) => Math.round(c * alpha + 255 * (1 - alpha));
  return [blend(r), blend(g), blend(b)];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => c.toString(16).padStart(2, '0').toUpperCase();
  return `${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hslToHex(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function hexToHsl(hex: string): { h: number, s: number, l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function ControlPanelHeader() {
  return (
    <div className="bg-[#f5f5f5] relative shrink-0 w-full" data-name="ControlPanelHeader">
      <div aria-hidden="true" className="absolute border-[#c4c4c4] border-[0px_1px_1px_0px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center w-full">
        <div className="content-stretch flex items-center px-[16px] pb-[10px] pt-[8px] xl:pb-[13px] xl:pt-[10px] 2xl:pb-[16px] 2xl:pt-[12px] relative w-full">
          <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[normal] shrink-0 text-[#7a7a7a] text-[14px] xl:text-[17px] 2xl:text-[21.33px] text-nowrap">RAMP CONTROLS</p>
          <div className="invisible flex items-center gap-[8px] opacity-0 pointer-events-none h-[24px] xl:h-[29px] 2xl:h-[36px]"></div>
        </div>
      </div>
    </div>
  );
}

function ColorScaleName({ name, onChange }: { name: string; onChange: (name: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);

  useEffect(() => {
    if (!isEditing) setTempName(name);
  }, [name, isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(tempName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBlur();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-name="RampName">
      {isEditing ? (
        <input
          autoFocus
          onFocus={(e) => e.target.select()}
          className="basis-0 font-['PP_Neue_Montreal:Book',sans-serif] grow leading-[normal] min-h-px min-w-px not-italic relative shrink-0 text-[#18180f] text-[30px] xl:text-[37.9px] 2xl:text-[47px] bg-transparent outline-none border-none p-0"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <p className="basis-0 font-['PP_Neue_Montreal:Book',sans-serif] grow leading-[normal] min-h-px min-w-px not-italic relative shrink-0 text-[#18180f] text-[30px] xl:text-[37.9px] 2xl:text-[47px] cursor-pointer"
          onClick={handleClick}
        >
          {name}
        </p>
      )}
    </div>
  );
}

function ColorPicker({ hue, saturation, lightness, onChange, min, max, steps, curve }: {
  hue: number;
  saturation: number;
  lightness: number;
  onChange: (s: number, l: number) => void;
  min: number;
  max: number;
  steps: number;
  curve: Curve;
}) {
  // Convert current HSL to OKLCH to get chroma AND hue in OKLCH space
  const currentHsl = { mode: 'hsl' as const, h: hue, s: saturation / 100, l: lightness / 100 };
  const currentOklch = toOklch(currentHsl);
  const currentChroma = currentOklch?.c || 0;
  const currentLightness = currentOklch?.l || 0.5;
  const currentOklchHue = currentOklch?.h || hue; // Extract OKLCH hue

  // Calculate the anchor lightness (target lightness for system rail)
  const getLValue = (index: number) => {
    if (steps <= 1) return max;
    const x = index / (steps - 1);
    // Newton-Raphson method to solve for t
    const solveCubicBezierX = (x: number, x1: number, x2: number): number => {
      let t = x;
      for (let i = 0; i < 8; i++) {
        const xEst = 3 * Math.pow(1 - t, 2) * t * x1 + 3 * (1 - t) * Math.pow(t, 2) * x2 + Math.pow(t, 3);
        const slope = 3 * Math.pow(1 - t, 2) * x1 - 6 * (1 - t) * t * x1 + 3 * (1 - t) * Math.pow(t, 2) + 6 * (1 - t) * t * x2 - 3 * Math.pow(t, 2) * x2 + 3 * Math.pow(t, 2);
        if (Math.abs(slope) < 1e-6) break;
        t -= (xEst - x) / slope;
      }
      return Math.max(0, Math.min(1, t));
    };
    const getCubicBezierY = (t: number, y1: number, y2: number): number => {
      return 3 * Math.pow(1 - t, 2) * t * y1 + 3 * (1 - t) * Math.pow(t, 2) * y2 + Math.pow(t, 3);
    };
    const t = solveCubicBezierX(x, curve.x1, curve.x2);
    const curveY = getCubicBezierY(t, curve.y1, curve.y2);
    const val = max - (curveY * (max - min));
    return Math.round(Math.max(0, Math.min(100, val)));
  };

  // Calculate all rail lightnesses
  const railLightnesses = Array.from({ length: steps }).map((_, i) => getLValue(i));

  // Find the anchor index (closest rail lightness to user's input)
  let anchorIndex = 0;
  let smallestDiff = Math.abs(railLightnesses[0] - lightness);
  for (let i = 1; i < railLightnesses.length; i++) {
    const diff = Math.abs(railLightnesses[i] - lightness);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      anchorIndex = i;
    }
  }

  // Get the target lightness in OKLCH space (0-1)
  const targetLightnessHSL = railLightnesses[anchorIndex];
  const targetColor = { mode: 'hsl' as const, h: hue, s: saturation / 100, l: targetLightnessHSL / 100 };
  const targetOklch = toOklch(targetColor);
  const targetLightness = targetOklch?.l || 0.5;

  // Handle changes from OKLrCHPicker (receives chroma and lightness in OKLCH space)
  const handleOklchChange = (c: number, l: number) => {
    // Convert OKLCH back to HSL for state management
    // IMPORTANT: Use the OKLCH hue, not HSL hue!
    const toHsl = converter('hsl');
    const oklchColor = { mode: 'oklch' as const, l, c, h: currentOklchHue };
    const hslColor = toHsl(oklchColor);

    if (hslColor && hslColor.s !== undefined && hslColor.l !== undefined) {
      const newS = hslColor.s * 100;
      const newL = hslColor.l * 100;
      onChange(newS, newL);
    }
  };

  return (
    <div className="bg-white relative shrink-0 w-full aspect-square select-none touch-none" data-name="ColorPicker">
      <OKLrCHPicker
        hue={currentOklchHue}
        lightness={targetLightness}
        chroma={currentChroma}
        onChange={handleOklchChange}
      />
    </div>
  );
}

function EyedropperLight() {
  return (
    <div className="relative shrink-0 size-[18px] xl:size-[22px] 2xl:size-[28px]" data-name="eyedropper-light">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27.8677 28.31">
        <g id="eyedropper-light">
          <path d={svgPaths.p3a335fb0} fill="var(--fill-0, #7A7A7A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function EyeDropper() {
  return (
    <div className="relative shrink-0 size-[32px] xl:size-[40px] 2xl:size-[50px]" data-name="EyeDropper">
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative rounded-[inherit] size-full cursor-pointer hover:bg-gray-100 transition-colors">
        <EyedropperLight />
      </div>
      <div aria-hidden="true" className="absolute border border-[#c4c4c4] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function HueBar({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onChange(Math.round(x * 360));
  }, [onChange]);

  const handleUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("pointermove", handleMove);
    window.removeEventListener("pointerup", handleUp);
  }, [handleMove]);

  const handleDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
    handleMove(e.nativeEvent);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  return (
    <div
      className="h-[16px] relative shrink-0 w-full cursor-pointer touch-none"
      data-name="HueBar"
      ref={containerRef}
      onPointerDown={handleDown}
    >
      <div
        className="absolute h-[16px] left-0 right-0 top-1/2 translate-y-[-50%] rounded-sm"
        style={{ background: "linear-gradient(90deg, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)" }}
      />
      <div
        className="absolute bg-[#020202] size-[24px] top-1/2 -translate-y-1/2 cursor-ew-resize border border-white shadow-sm -ml-[12px]"
        style={{ left: `${(hue / 360) * 100}%` }}
        data-name="Handle"
      />
    </div>
  );
}

function OpacityBar({ opacity, hue, saturation, lightness, onChange }: { opacity: number; hue: number; saturation: number; lightness: number; onChange: (o: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onChange(Math.round(x * 100));
  }, [onChange]);

  const handleUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("pointermove", handleMove);
    window.removeEventListener("pointerup", handleUp);
  }, [handleMove]);

  const handleDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
    handleMove(e.nativeEvent);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  return (
    <div
      className="h-[16px] relative shrink-0 w-full cursor-pointer touch-none"
      data-name="OpacityBar"
      ref={containerRef}
      onPointerDown={handleDown}
    >
      <div className="absolute h-[16px] left-0 right-0 top-1/2 translate-y-[-50%] overflow-hidden rounded-sm">
        {/* Checkerboard background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
            backgroundSize: '10px 10px',
            backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
            backgroundColor: 'white'
          }}
        />
        {/* Gradient from transparent to color */}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to right, transparent, ${color})` }}
        />
      </div>
      <div
        className="absolute bg-[#020202] size-[24px] top-1/2 -translate-y-1/2 cursor-ew-resize border border-white shadow-sm -ml-[12px]"
        style={{ left: `${opacity}%` }}
        data-name="Handle"
      />
    </div>
  );
}

function CaretDownLight() {
  return (
    <div className="relative shrink-0 size-[20px] xl:size-[25px] 2xl:size-[28.31px]" data-name="caret-down-light">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28.31 28.31">
        <g id="caret-down-light">
          <path d={svgPathsK.p1efa0f00} fill="var(--fill-0, #18180F)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function InputTypeDropDown() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 border border-[#c4c4c4] border-solid" data-name="InputTypeDropDown">
      {/* Type */}
      <div className="content-stretch flex flex-col items-center justify-center px-[8px] xl:px-[12px] 2xl:px-[16px] relative shrink-0">
        <p className="font-['PP_Neue_Montreal:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18180f] text-[14px] xl:text-[17px] 2xl:text-[21.33px] w-full">Hex</p>
      </div>
      {/* Chevron */}
      <div className="content-stretch flex h-full items-center relative shrink-0" data-name="Chevron">
        <div className="bg-[#c4c4c4] h-full shrink-0 w-px" data-name="Div" />
        <div className="content-stretch flex flex-col items-center justify-center overflow-clip px-[4px] relative shrink-0" data-name="plus">
          <CaretDownLight />
        </div>
      </div>
    </div>
  );
}

function ColorInput({ hue, saturation, lightness, opacity, onColorChange, onOpacityChange, min, max, steps, curve }: {
  hue: number; saturation: number; lightness: number; opacity: number;
  onColorChange: (h: number, s: number, l: number) => void;
  onOpacityChange: (o: number) => void;
  min: number;
  max: number;
  steps: number;
  curve: Curve;
}) {
  // Helper function to compute system-snapped color
  const getSystemSnappedHex = () => {
    // Calculate rail lightnesses using the same logic as generateOklchRamp
    const getLValue = (index: number) => {
      if (steps <= 1) return max;
      const x = index / (steps - 1);
      const solveCubicBezierX = (x: number, x1: number, x2: number): number => {
        let t = x;
        for (let i = 0; i < 8; i++) {
          const xEst = 3 * Math.pow(1 - t, 2) * t * x1 + 3 * (1 - t) * Math.pow(t, 2) * x2 + Math.pow(t, 3);
          const slope = 3 * Math.pow(1 - t, 2) * x1 - 6 * (1 - t) * t * x1 + 3 * (1 - t) * Math.pow(t, 2) + 6 * (1 - t) * t * x2 - 3 * Math.pow(t, 2) * x2 + 3 * Math.pow(t, 2);
          if (Math.abs(slope) < 1e-6) break;
          t -= (xEst - x) / slope;
        }
        return Math.max(0, Math.min(1, t));
      };
      const getCubicBezierY = (t: number, y1: number, y2: number): number => {
        return 3 * Math.pow(1 - t, 2) * t * y1 + 3 * (1 - t) * Math.pow(t, 2) * y2 + Math.pow(t, 3);
      };
      const t = solveCubicBezierX(x, curve.x1, curve.x2);
      const curveY = getCubicBezierY(t, curve.y1, curve.y2);
      const val = max - (curveY * (max - min));
      return Math.round(Math.max(0, Math.min(100, val)));
    };

    const railLightnesses = Array.from({ length: steps }).map((_, i) => getLValue(i));

    // Run the color through the system engine
    const { colors } = generateOklchRamp(hue, saturation, lightness, railLightnesses);

    // Find the anchor index (closest to user's input)
    let anchorIndex = 0;
    let smallestDiff = Math.abs(railLightnesses[0] - lightness);
    for (let i = 1; i < railLightnesses.length; i++) {
      const diff = Math.abs(railLightnesses[i] - lightness);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        anchorIndex = i;
      }
    }

    // Get the system-processed color at the anchor
    const systemColorHex = colors[anchorIndex];

    // Apply opacity blending
    const hexToRgb = (hex: string): [number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return [0, 0, 0];
      return [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ];
    };

    const [r, g, b] = hexToRgb(systemColorHex);
    const [r2, g2, b2] = blendWithWhite(r, g, b, opacity);
    return rgbToHex(r2, g2, b2);
  };

  const [hex, setHex] = useState(getSystemSnappedHex());
  const [localOpacity, setLocalOpacity] = useState(String(opacity));

  useEffect(() => {
    setHex(getSystemSnappedHex());
  }, [hue, saturation, lightness, opacity]);

  useEffect(() => {
    setLocalOpacity(String(opacity));
  }, [opacity]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHex(val);
    const hsl = hexToHsl(val);
    if (hsl) {
      onColorChange(hsl.h, hsl.s, hsl.l);
    }
  };

  const handleOpacityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalOpacity(e.target.value);
  };

  const handleOpacityBlur = () => {
    let val = parseInt(localOpacity, 10);
    if (isNaN(val)) val = 100;
    val = Math.max(0, Math.min(100, val));
    onOpacityChange(val);
    setLocalOpacity(String(val));
  };

  const handleOpacityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleOpacityBlur();
  };

  return (
    <div className="content-stretch flex gap-[8px] xl:gap-[12px] 2xl:gap-[16px] items-stretch relative w-full h-[32px] xl:h-[40px] 2xl:h-[50px]" data-name="ColorInput">
      <InputTypeDropDown />

      {/* Input Group */}
      <div className="basis-0 content-stretch flex grow items-center justify-between min-h-px min-w-px relative shrink-0 border border-[#c4c4c4] border-solid" data-name="Input">

        {/* Hex Input */}
        <div className="basis-0 grow min-h-px min-w-px relative shrink-0" data-name="InputField">
          <div className="flex flex-col items-center justify-center size-full">
            <div className="content-stretch flex flex-col items-center justify-center px-[8px] xl:px-[12px] 2xl:px-[16px] relative w-full">
              <input
                value={hex}
                onChange={handleHexChange}
                className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#18180f] text-[14px] xl:text-[17px] 2xl:text-[21.33px] w-full bg-transparent outline-none border-none text-center uppercase"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="bg-[#c4c4c4] h-full shrink-0 w-px" />

        {/* Opacity */}
        <div className="content-stretch flex gap-[8px] items-center justify-center px-[8px] xl:px-[12px] 2xl:px-[16px] relative shrink-0" data-name="Opacity">
          <input
            value={localOpacity}
            onChange={handleOpacityInputChange}
            onBlur={handleOpacityBlur}
            onKeyDown={handleOpacityKeyDown}
            className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#18180f] text-[14px] xl:text-[17px] 2xl:text-[21.33px] w-[3ch] bg-transparent outline-none border-none text-right"
          />
          <p className="font-['PP_Neue_Montreal:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18180f] text-[14px] xl:text-[17px] 2xl:text-[21.33px] text-nowrap">%</p>
        </div>
      </div>
    </div>
  );
}

function Frame1({ hue, saturation, lightness, opacity, onHueChange, onColorChange, onOpacityChange, min, max, steps, curve }: {
  hue: number; saturation: number; lightness: number; opacity: number;
  onHueChange: (h: number) => void;
  onColorChange: (h: number, s: number, l: number) => void;
  onOpacityChange: (o: number) => void;
  min: number;
  max: number;
  steps: number;
  curve: Curve;
}) {
  return (
    <div className="content-stretch flex gap-[24px] items-stretch relative shrink-0 w-full">
      <div className="basis-0 content-stretch flex flex-col gap-[24px] grow items-start min-h-px min-w-px relative shrink-0 justify-center">
        <HueBar hue={hue} onChange={onHueChange} />
        <OpacityBar opacity={opacity} hue={hue} saturation={saturation} lightness={lightness} onChange={onOpacityChange} />
        <ColorInput
          hue={hue}
          saturation={saturation}
          lightness={lightness}
          opacity={opacity}
          onColorChange={onColorChange}
          onOpacityChange={onOpacityChange}
          min={min}
          max={max}
          steps={steps}
          curve={curve}
        />
      </div>
    </div>
  );
}

function ControlsNewColorScale({ palette, onChange, min, max, steps, curve }: {
  palette: PaletteData;
  onChange: (updates: Partial<PaletteData>) => void;
  min: number;
  max: number;
  steps: number;
  curve: Curve;
}) {
  const handleNameChange = (name: string) => onChange({ name });
  const handleColorChange = (s: number, l: number) => onChange({ saturation: s, lightness: l });
  const handleHueChange = (hue: number) => onChange({ hue });
  const handleOpacityChange = (opacity: number) => onChange({ opacity });

  // New handler for full color change from Hex input
  const handleFullColorChange = (h: number, s: number, l: number) => onChange({ hue: h, saturation: s, lightness: l });

  return (
    <div className="bg-[#f5f5f5] flex-1 relative w-full overflow-auto" data-name="Controls--NewColorScale">
      <div aria-hidden="true" className="absolute border-[#c4c4c4] border-[0px_1px_0px_0px] border-solid inset-0 pointer-events-none" />
      <div className="size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
          <ColorScaleName name={palette.name} onChange={handleNameChange} />
          <ColorPicker
            hue={palette.hue}
            saturation={palette.saturation}
            lightness={palette.lightness}
            onChange={handleColorChange}
            min={min}
            max={max}
            steps={steps}
            curve={curve}
          />
          <Frame1
            hue={palette.hue}
            saturation={palette.saturation}
            lightness={palette.lightness}
            opacity={palette.opacity}
            onHueChange={handleHueChange}
            onColorChange={handleFullColorChange}
            onOpacityChange={handleOpacityChange}
            min={min}
            max={max}
            steps={steps}
            curve={curve}
          />
        </div>
      </div>
    </div>
  );
}

export default function ControlPanel({ palette, onChange, min, max, steps, curve }: {
  palette?: PaletteData;
  onChange?: (updates: Partial<PaletteData>) => void;
  min: number;
  max: number;
  steps: number;
  curve: Curve;
}) {
  // If no palette selected (shouldn't happen given parent logic, but for safety)
  if (!palette || !onChange) {
    return <div className="p-4 text-gray-500">No ramp selected</div>;
  }

  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="ControlPanel">
      <ControlPanelHeader />
      <ControlsNewColorScale palette={palette} onChange={onChange} min={min} max={max} steps={steps} curve={curve} />
    </div>
  );
}