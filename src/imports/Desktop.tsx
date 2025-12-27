import svgPaths from "./svg-jpfemsx01m";
import clsx from "clsx";
import imgExampleGrid from "figma:asset/c4d507563c5edd8adffbf8c880bffd300fe93c4a.png";
import { Copy, Check } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from "react";
import { Toaster, toast } from "sonner@2.0.3";
type Curve = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

// Newton-Raphson method to solve for t given x in a cubic bezier with P0=(0,0), P3=(1,1)
function solveCubicBezierX(x: number, x1: number, x2: number): number {
  let t = x;
  for (let i = 0; i < 8; i++) {
    const xEst = 3 * Math.pow(1 - t, 2) * t * x1 + 3 * (1 - t) * Math.pow(t, 2) * x2 + Math.pow(t, 3);
    const slope = 3 * Math.pow(1 - t, 2) * x1 - 6 * (1 - t) * t * x1 + 3 * (1 - t) * Math.pow(t, 2) + 6 * (1 - t) * t * x2 - 3 * Math.pow(t, 2) * x2 + 3 * Math.pow(t, 2);
    if (Math.abs(slope) < 1e-6) break;
    t -= (xEst - x) / slope;
  }
  return Math.max(0, Math.min(1, t));
}

function getCubicBezierY(t: number, y1: number, y2: number): number {
  return 3 * Math.pow(1 - t, 2) * t * y1 + 3 * (1 - t) * Math.pow(t, 2) * y2 + Math.pow(t, 3);
}

function getCurveY(x: number, curve: Curve): number {
  const t = solveCubicBezierX(x, curve.x1, curve.x2);
  return getCubicBezierY(t, curve.y1, curve.y2);
}

// Curve Preset Configuration
type CurvePreset = {
  name: string;
  description: string;
  coordinates: Curve;
};

const CURVE_PRESETS: CurvePreset[] = [
  {
    name: "Uniform",
    description: "Linear distribution. Good for data viz.",
    coordinates: { x1: 0.5, y1: 0.5, x2: 0.5, y2: 0.5 }
  },
  {
    name: "Mid-Tone Focus",
    description: "Expands middle steps. Good for status colors.",
    coordinates: { x1: 0.15, y1: 0.9, x2: 0.85, y2: 0.1 }
  },
  {
    name: "Surface Focus",
    description: "Expands light/dark ends. Good for backgrounds & text.",
    coordinates: { x1: 0.42, y1: 0.0, x2: 0.58, y2: 1.0 }
  },
  {
    name: "Shadow Focus",
    description: "More steps in the darks. Good for Dark Mode.",
    coordinates: { x1: 0, y1: 0, x2: 0.58, y2: 1 }
  },
  {
    name: "Tint Focus",
    description: "More steps in the lights. Good for Light Mode.",
    coordinates: { x1: 0.42, y1: 0, x2: 1, y2: 1 }
  }
];


function LightnessScaleItemText1({ text }: LightnessScaleItemText1Props) {
  return (
    <div className="basis-0 content-stretch flex grow items-center min-h-px min-w-px relative shrink-0">
      <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#7a7a7a] text-[10px] xl:text-[11px] 2xl:text-[12px] text-nowrap">{text}</p>
    </div>
  );
}
type LightnessScaleItemTextProps = {
  text: string;
};

function LightnessScaleItemText({ text }: LightnessScaleItemTextProps) {
  return (
    <div className="basis-0 content-stretch flex grow items-center min-h-px min-w-px relative shrink-0">
      <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#18180f] text-[12px] xl:text-[14px] 2xl:text-[16px] text-nowrap">{text}</p>
    </div>
  );
}
type LightnessCurveGraphBezierHandleProps = {
  additionalClassNames?: string;
};

function LightnessCurveGraphBezierHandle({ additionalClassNames = "" }: LightnessCurveGraphBezierHandleProps) {
  return (
    <div className={clsx("absolute size-[16px]", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <circle cx="8" cy="8" fill="var(--fill-0, black)" id="BezierHandle" r="8" />
      </svg>
    </div>
  );
}
type TextProps = {
  text: string;
  onClick?: () => void;
  isEditing?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

function Text({ text, onClick, isEditing, onChange, onBlur, onKeyDown }: TextProps) {
  if (isEditing) {
    return (
      <div className="content-stretch flex flex-col items-start justify-center pb-[12px] pt-[8px] px-[16px] relative shrink-0 flex-1">
        <input
          type="text"
          value={text}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          autoFocus
          onFocus={(e) => e.target.select()}
          className="font-['PP_Neue_Montreal:Book',sans-serif] leading-[normal] not-italic text-[#18180f] text-[12px] xl:text-[14px] 2xl:text-[16px] w-full bg-transparent border-none outline-none"
        />
      </div>
    );
  }

  return (
    <div
      className="content-stretch flex flex-col items-start justify-center pb-[12px] pt-[8px] px-[16px] relative shrink-0 cursor-pointer flex-1"
      onClick={onClick}
    >
      <p className="font-['PP_Neue_Montreal:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18180f] text-[12px] xl:text-[14px] 2xl:text-[16px]">{text}</p>
    </div>
  );
}

function ControlPanelHeader() {
  return (
    <div className="bg-[#f5f5f5] relative shrink-0 w-full" data-name="ControlPanelHeader">
      <div aria-hidden="true" className="absolute border-[#c4c4c4] border-[0px_1px_1px_0px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center w-full">
        <div className="content-stretch flex items-center px-[16px] pb-[10px] pt-[8px] xl:pb-[13px] xl:pt-[10px] 2xl:pb-[16px] 2xl:pt-[12px] relative w-full">
          <p className="absolute left-[16px] top-1/2 -translate-y-1/2 font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[normal] shrink-0 text-[#7a7a7a] text-[12px] xl:text-[14px] 2xl:text-[16px] text-nowrap">SYSTEM CONTROLS</p>
          {/* Phantom element: mimic "Export" content (Text + Icon) which is the tallest element in Navigation */}
          <div className="invisible flex items-center gap-[8px] opacity-0 pointer-events-none">
            <p className="font-['PP_Neue_Montreal:Book',sans-serif] leading-[normal] text-[12px] xl:text-[14px] 2xl:text-[16px] text-nowrap">Export</p>
            <div className="relative shrink-0 size-[16px] xl:size-[18px] 2xl:size-[20px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

type EditableLabelProps = {
  value: number;
  onCommit: (val: number) => void;
  suffix?: string;
};

function EditableLabel({ value, onCommit, suffix = "" }: EditableLabelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));

  useEffect(() => {
    if (!isEditing) {
      setInputValue(String(Math.round(value)));
    }
  }, [value, isEditing]);

  const handleClick = () => {
    setIsEditing(true);
    setInputValue(String(Math.round(value)));
  };

  const handleBlur = () => {
    const num = parseInt(inputValue, 10);
    if (!isNaN(num)) {
      onCommit(num);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        onFocus={(e) => e.target.select()}
        className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[normal] text-[#18180f] text-[10px] xl:text-[11px] 2xl:text-[12px] bg-transparent border-none outline-none w-[4ch] p-0 m-0 text-center"
      />
    );
  }

  return (
    <p
      onClick={handleClick}
      className="relative shrink-0 cursor-pointer hover:text-[#18180f] transition-colors"
    >
      {Math.round(value)}{suffix}
    </p>
  );
}

type LabelsProps = {
  min: number;
  max: number;
  onMinChange: (val: number) => void;
  onMaxChange: (val: number) => void;
};

function Labels({ min, max, onMinChange, onMaxChange }: LabelsProps) {
  return (
    <div className="content-stretch flex font-['JetBrains_Mono:Regular',sans-serif] font-normal items-end justify-between leading-[normal] relative shrink-0 text-[#7a7a7a] text-[10px] xl:text-[11px] 2xl:text-[12px] text-nowrap w-full" data-name="Labels">
      <EditableLabel value={max} onCommit={onMaxChange} suffix="%" />
      <EditableLabel value={min} onCommit={onMinChange} suffix="%" />
    </div>
  );
}

type PortionActiveProps = {
  left: string;
  width: string;
  onMinDragStart: (e: React.PointerEvent) => void;
  onMaxDragStart: (e: React.PointerEvent) => void;
};

function PortionActive({ left, width, onMinDragStart, onMaxDragStart }: PortionActiveProps) {
  return (
    <div
      className="absolute content-stretch flex items-center top-0"
      style={{ left, width }}
      data-name="PortionActive"
    >
      <div
        className="bg-[#020202] shrink-0 size-[16px] cursor-ew-resize hover:scale-125 transition-transform"
        data-name="HandleMin"
        onPointerDown={onMaxDragStart}
      />
      <div className="basis-0 bg-[#020202] grow h-[6px] min-h-px min-w-px shrink-0" data-name="Active" />
      <div
        className="bg-[#020202] shrink-0 size-[16px] cursor-ew-resize hover:scale-125 transition-transform"
        data-name="HandleMax"
        onPointerDown={onMinDragStart}
      />
    </div>
  );
}

type LightnessLimitControlBarProps = {
  min: number;
  max: number;
  onMinDragStart: (e: React.PointerEvent) => void;
  onMaxDragStart: (e: React.PointerEvent) => void;
  barRef: React.RefObject<HTMLDivElement>;
};

function LightnessLimitControlBar({ min, max, onMinDragStart, onMaxDragStart, barRef }: LightnessLimitControlBarProps) {
  // 100 on left, 0 on right.
  // Left handle (max lightness) position from left: 100 - max
  // Right handle (min lightness) position from left: 100 - min
  // Width: (100 - min) - (100 - max) = max - min

  const leftPos = `${100 - max}%`;
  const widthVal = `${max - min}%`;

  return (
    <div ref={barRef} className="h-[16px] relative shrink-0 w-full" data-name="LightnessLimitControlBar">
      <div className="absolute bg-[#e6e6e6] h-[6px] left-0 top-[5px] w-full" data-name="PortionDisabled" />
      <PortionActive
        left={leftPos}
        width={widthVal}
        onMinDragStart={onMinDragStart}
        onMaxDragStart={onMaxDragStart}
      />
    </div>
  );
}

function LightnessRangeControls({ min, max, onChange }: { min: number; max: number; onChange: (min: number, max: number) => void }) {
  const barRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<"min" | "max" | null>(null);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current || !barRef.current) return;

    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    // Percentage from left (0 to 100)
    let percent = (x / width) * 100;
    percent = Math.max(0, Math.min(100, percent));

    // Convert to value (inverted scale: 0px = 100, width = 0)
    const value = 100 - percent;

    if (isDragging.current === "max") {
      // Dragging left handle (Max Lightness)
      // Must be >= min
      const newMax = Math.max(min, Math.min(100, value));
      onChange(min, newMax);
    } else {
      // Dragging right handle (Min Lightness)
      // Must be <= max
      const newMin = Math.max(0, Math.min(max, value));
      onChange(newMin, max);
    }
  }, [min, max, onChange]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }, [handlePointerMove]);

  const startDrag = (type: "min" | "max") => (e: React.PointerEvent) => {
    e.preventDefault();
    isDragging.current = type;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleMinChange = (newMin: number) => {
    // Clamp between 0 and current max
    const val = Math.max(0, Math.min(max, newMin));
    onChange(val, max);
  };

  const handleMaxChange = (newMax: number) => {
    // Clamp between current min and 100
    const val = Math.max(min, Math.min(100, newMax));
    onChange(min, val);
  };

  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="LightnessRangeControls">
      <Labels
        min={min}
        max={max}
        onMinChange={handleMinChange}
        onMaxChange={handleMaxChange}
      />
      <LightnessLimitControlBar
        min={min}
        max={max}
        onMinDragStart={startDrag("min")}
        onMaxDragStart={startDrag("max")}
        barRef={barRef}
      />
    </div>
  );
}

function LightnessRange({ min, max, onChange }: { min: number; max: number; onChange: (min: number, max: number) => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="LightnessRange">
      <p className="font-['PP_Neue_Montreal:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18180f] text-[12px] xl:text-[14px] 2xl:text-[16px] text-nowrap">Lightness Range</p>
      <LightnessRangeControls min={min} max={max} onChange={onChange} />
    </div>
  );
}

type MinusProps = {
  onClick?: () => void;
};

function Minus({ onClick }: MinusProps) {
  return (
    <div
      className="relative shrink-0 size-[32px] xl:size-[40px] 2xl:size-[50px] cursor-pointer hover:bg-[#e6e6e6] active:scale-90 transition-all"
      data-name="minus"
      onClick={onClick}
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 46 46">
        <g id="minus">
          <path d={svgPaths.pa84bf00} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Plus() {
  return (
    <div className="relative shrink-0 size-[20px] xl:size-[25px] 2xl:size-[28.308px]" data-name="plus">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28.3077 28.3077">
        <g id="plus">
          <path d={svgPaths.p2fc198c0} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

type Plus1Props = {
  onClick?: () => void;
};

function Plus1({ onClick }: Plus1Props) {
  return (
    <div
      className="content-stretch flex flex-col items-center justify-center overflow-clip px-[3.538px] py-[14.154px] relative shrink-0 size-[32px] xl:size-[40px] 2xl:size-[50px] cursor-pointer hover:bg-[#e6e6e6] active:scale-90 transition-all"
      data-name="plus"
      onClick={onClick}
    >
      <Plus />
    </div>
  );
}

type StepperProps = {
  onDecrement?: () => void;
  onIncrement?: () => void;
};

function Stepper({ onDecrement, onIncrement }: StepperProps) {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0" data-name="Stepper">
      <div className="bg-[#c4c4c4] h-full shrink-0 w-px" data-name="Div" />
      <Minus onClick={onDecrement} />
      <div className="bg-[#c4c4c4] h-full shrink-0 w-px" data-name="Div" />
      <Plus1 onClick={onIncrement} />
    </div>
  );
}

function Stepper1({ steps, onChange }: { steps: number; onChange: (val: number) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(steps));

  // Update inputValue if steps changes externally and we are not editing
  useEffect(() => {
    if (!isEditing) {
      setInputValue(String(steps));
    }
  }, [steps, isEditing]);

  const handleDecrement = () => {
    onChange(Math.max(3, steps - 1));
  };

  const handleIncrement = () => {
    onChange(Math.min(15, steps + 1));
  };

  const handleTextClick = () => {
    setInputValue(String(steps));
    setIsEditing(true);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue)) {
      // Clamp value between 3 and 15
      const clampedValue = Math.max(3, Math.min(15, numValue));
      onChange(clampedValue);
    } else {
      setInputValue(String(steps));
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Stepper">
      <div aria-hidden="true" className="absolute border border-[#c4c4c4] border-solid inset-0 pointer-events-none" />
      <Text
        text={isEditing ? inputValue : String(steps)}
        onClick={handleTextClick}
        isEditing={isEditing}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      <div className="flex flex-row items-center self-stretch">
        <Stepper onDecrement={handleDecrement} onIncrement={handleIncrement} />
      </div>
    </div>
  );
}

function Steps({ steps, onChange }: { steps: number; onChange: (val: number) => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Steps">
      <p className="font-['PP_Neue_Montreal:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18180f] text-[12px] xl:text-[14px] 2xl:text-[16px] text-nowrap">Steps</p>
      <Stepper1 steps={steps} onChange={onChange} />
    </div>
  );
}

function CaretDownLight() {
  return (
    <div className="relative shrink-0 size-[28.31px]" data-name="caret-down-light">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28.31 28.31">
        <g id="caret-down-light">
          <path d={svgPaths.p1efa0f00} fill="var(--fill-0, #18180F)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Plus2() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip px-[3.538px] py-[14.154px] relative shrink-0 size-[32px] xl:size-[40px] 2xl:size-[50px]" data-name="plus">
      <CaretDownLight />
    </div>
  );
}

function Stepper2() {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0" data-name="Stepper">
      <div className="bg-[#c4c4c4] h-full shrink-0 w-px" data-name="Div" />
      <Plus2 />
    </div>
  );
}

function DropDown({ label }: { label: string }) {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="DropDown">
      <div aria-hidden="true" className="absolute border border-[#c4c4c4] border-solid inset-0 pointer-events-none" />
      <Text text={label} />
      <div className="flex flex-row items-center self-stretch">
        <Stepper2 />
      </div>
    </div>
  );
}

function LightnessCurvePresets({ curve, onChange }: { curve: Curve; onChange: (c: Curve) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Helper to compare curves with small epsilon for floating-point tolerance
  const curvesMatch = (c1: Curve, c2: Curve) => {
    const epsilon = 0.001;
    return Math.abs(c1.x1 - c2.x1) < epsilon &&
      Math.abs(c1.y1 - c2.y1) < epsilon &&
      Math.abs(c1.x2 - c2.x2) < epsilon &&
      Math.abs(c1.y2 - c2.y2) < epsilon;
  };

  // Find which preset (if any) matches the current curve
  const activePreset = CURVE_PRESETS.find(preset => curvesMatch(curve, preset.coordinates));
  const label = activePreset ? activePreset.name : "Custom";

  const handlePresetClick = (preset: CurvePreset) => {
    onChange(preset.coordinates);
    setIsOpen(false);
  };

  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="LightnessCurvePresets">
      <p className="font-['PP_Neue_Montreal:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18180f] text-[12px] xl:text-[14px] 2xl:text-[16px] text-nowrap">Lightness Curve</p>

      {/* Position Wrapper */}
      <div className="relative w-full" ref={containerRef}>
        {/* Dropdown Trigger */}
        <div
          className="content-stretch flex items-center justify-between relative shrink-0 w-full cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div aria-hidden="true" className="absolute border border-[#c4c4c4] border-solid inset-0 pointer-events-none" />
          <div className="content-stretch flex flex-col items-start justify-center pb-[12px] pt-[8px] px-[16px] relative shrink-0 flex-1">
            <p className="font-['PP_Neue_Montreal:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18180f] text-[12px] xl:text-[14px] 2xl:text-[16px]">{label}</p>
          </div>
          <div className="flex flex-row items-center self-stretch">
            <div className="content-stretch flex h-full items-center relative shrink-0">
              <div className="bg-[#c4c4c4] h-full shrink-0 w-px" />
              <div className="content-stretch flex flex-col items-center justify-center overflow-clip px-[3.538px] py-[14.154px] relative shrink-0 size-[32px] xl:size-[40px] 2xl:size-[50px]">
                <CaretDownLight />
              </div>
            </div>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 bg-white border border-[#c4c4c4] border-t-0 shadow-lg">
            {CURVE_PRESETS.map((preset) => {
              const isActive = curvesMatch(curve, preset.coordinates);
              return (
                <div
                  key={preset.name}
                  className={clsx(
                    "px-[16px] pt-[6px] pb-[8px] cursor-pointer hover:bg-[#f5f5f5] border-b border-[#e6e6e6] last:border-b-0",
                    isActive && "bg-[#f5f5f5]"
                  )}
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    handlePresetClick(preset);
                  }}
                >
                  <p className="font-['PP_Neue_Montreal:Book',sans-serif] text-[#18180f] text-[12px] xl:text-[14px] 2xl:text-[16px] font-medium">
                    {preset.name}
                  </p>
                  <p className="font-['PP_Neue_Montreal:Book',sans-serif] text-[#7a7a7a] text-[10px] xl:text-[11px] 2xl:text-[12px] mt-[4px]">
                    {preset.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function LightnessCurveGraph({ curve, onChange, steps }: { curve: Curve; onChange: (c: Curve) => void; steps: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<"1" | "2" | null>(null);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Clamp to 0-1
    const clampedX = Math.max(0, Math.min(1, x));
    const clampedY = Math.max(0, Math.min(1, y));

    const newCurve = { ...curve };
    if (isDragging.current === "1") {
      newCurve.x1 = clampedX;
      newCurve.y1 = clampedY;
    } else {
      newCurve.x2 = clampedX;
      newCurve.y2 = clampedY;
    }
    onChange(newCurve);
  }, [curve, onChange]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }, [handlePointerMove]);

  const startDrag = (handle: "1" | "2") => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = handle;
    document.body.style.cursor = "pointer";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Convert normalized coords to SVG coords (0..100) for display
  const p0 = { x: 0, y: 0 };
  const p3 = { x: 100, y: 100 };
  const cp1 = { x: curve.x1 * 100, y: curve.y1 * 100 };
  const cp2 = { x: curve.x2 * 100, y: curve.y2 * 100 };

  const pathD = `M ${p0.x} ${p0.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p3.x} ${p3.y}`;

  return (
    <div className="bg-white relative shrink-0 w-full aspect-square" data-name="LightnessCurveGraph">
      <div
        ref={containerRef}
        className="overflow-clip relative rounded-[inherit] size-full"
      >
        <div className="absolute left-0 size-full top-0 pointer-events-none" data-name="Grid">
          <svg className="block size-full" width="100%" height="100%" preserveAspectRatio="none">
            {/* Vertical Lines */}
            {Array.from({ length: steps }).map((_, i) => {
              const x = (i / (steps - 1)) * 100;
              return (
                <line
                  key={`v-${i}`}
                  x1={`${x}%`}
                  y1="0%"
                  x2={`${x}%`}
                  y2="100%"
                  stroke="#e6e6e6"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
            {/* Horizontal Lines */}
            {Array.from({ length: steps }).map((_, i) => {
              const y = (i / (steps - 1)) * 100;
              return (
                <line
                  key={`h-${i}`}
                  x1="0%"
                  y1={`${y}%`}
                  x2="100%"
                  y2={`${y}%`}
                  stroke="#e6e6e6"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>
        </div>
        <div className="absolute left-0 size-full top-0" data-name="Bezier">
          <div className="absolute inset-0">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d={pathD} id="Bezier" stroke="var(--stroke-0, black)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              {/* Handle Lines */}
              <line x1={p0.x} y1={p0.y} x2={cp1.x} y2={cp1.y} stroke="#c4c4c4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <line x1={p3.x} y1={p3.y} x2={cp2.x} y2={cp2.y} stroke="#c4c4c4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        </div>

        {/* Handle 1 */}
        <div
          className="absolute size-[16px] -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-none hover:scale-125 transition-transform bg-[#020202]"
          style={{ left: `${curve.x1 * 100}%`, top: `${curve.y1 * 100}%` }}
          onPointerDown={startDrag("1")}
        />

        {/* Handle 2 */}
        <div
          className="absolute size-[16px] -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-none hover:scale-125 transition-transform bg-[#020202]"
          style={{ left: `${curve.x2 * 100}%`, top: `${curve.y2 * 100}%` }}
          onPointerDown={startDrag("2")}
        />

      </div>
      <div aria-hidden="true" className="absolute border border-[#c4c4c4] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function LightnessCurve({ curve, onChange, steps }: { curve: Curve; onChange: (c: Curve) => void; steps: number }) {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-full" data-name="LightnessCurve">
      <LightnessCurvePresets curve={curve} onChange={onChange} />
      <LightnessCurveGraph curve={curve} onChange={onChange} steps={steps} />
    </div>
  );
}

function ControlsSystem({ min, max, steps, curve, onRangeChange, onStepsChange, onCurveChange }: {
  min: number;
  max: number;
  steps: number;
  curve: Curve;
  onRangeChange: (min: number, max: number) => void;
  onStepsChange: (steps: number) => void;
  onCurveChange: (c: Curve) => void;
}) {
  return (
    <div className="bg-[#f5f5f5] flex-1 relative w-full overflow-auto" data-name="Controls--System">
      <div aria-hidden="true" className="absolute border-[#c4c4c4] border-[0px_1px_0px_0px] border-solid inset-0 pointer-events-none" />
      <div className="size-full">
        <div className="content-stretch flex flex-col gap-[32px] items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
          <LightnessRange min={min} max={max} onChange={onRangeChange} />
          <Steps steps={steps} onChange={onStepsChange} />
          <LightnessCurve curve={curve} onChange={onCurveChange} steps={steps} />
        </div>
      </div>
    </div>
  );
}

import RampControlPanel from "./ControlPanel";

export type PaletteData = {
  id: string;
  name: string;
  hue: number;        // OKLCH hue (0-360)
  chroma: number;     // OKLCH chroma (0-0.4)
  lightness: number;  // OKLCH lightness (0-1)
  opacity: number;
};

function ControlPanel({ min, max, steps, curve, onRangeChange, onStepsChange, onCurveChange, selectedId, selectedPalette, onPaletteChange }: {
  min: number;
  max: number;
  steps: number;
  curve: Curve;
  onRangeChange: (min: number, max: number) => void;
  onStepsChange: (steps: number) => void;
  onCurveChange: (c: Curve) => void;
  selectedId: string;
  selectedPalette?: PaletteData;
  onPaletteChange?: (id: string, updates: Partial<PaletteData>) => void;
}) {
  if (selectedId !== 'system' && selectedPalette && onPaletteChange) {
    return (
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-[22vw] h-screen" data-name="ControlPanel">
        <RampControlPanel
          palette={selectedPalette}
          onChange={(updates) => onPaletteChange(selectedPalette.id, updates)}
          min={min}
          max={max}
          steps={steps}
          curve={curve}
        />
      </div>
    );
  }

  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[22vw] h-screen" data-name="ControlPanel">
      <ControlPanelHeader />
      <ControlsSystem min={min} max={max} steps={steps} curve={curve} onRangeChange={onRangeChange} onStepsChange={onStepsChange} onCurveChange={onCurveChange} />
    </div>
  );
}

function Documentation() {
  return (
    <div className="content-stretch flex items-center justify-center pb-[10px] pt-[8px] xl:pb-[13px] xl:pt-[10px] 2xl:pb-[16px] 2xl:pt-[12px] px-[16px] relative shrink-0" data-name="Documentation">
      <div aria-hidden="true" className="absolute border-[#c4c4c4] border-[0px_0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <p className="font-['PP_Neue_Montreal:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#7a7a7a] text-[12px] xl:text-[14px] 2xl:text-[16px] text-nowrap">Documentation</p>
    </div>
  );
}

function ExportLight() {
  return (
    <div className="relative shrink-0 size-[16px] xl:size-[18px] 2xl:size-[20px]" data-name="export-light">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="export-light">
          <path d={svgPaths.p2f505f00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Export() {
  return (
    <div className="bg-[#020202] content-stretch flex gap-[8px] items-center justify-center pb-[10px] pt-[8px] xl:pb-[13px] xl:pt-[10px] 2xl:pb-[16px] 2xl:pt-[12px] px-[16px] relative shrink-0" data-name="Export">
      <p className="font-['PP_Neue_Montreal:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[12px] xl:text-[14px] 2xl:text-[16px] text-nowrap text-white">Export</p>
      <ExportLight />
    </div>
  );
}

function ButtonGroup() {
  return (
    <div className="content-stretch flex items-center justify-end relative shrink-0" data-name="ButtonGroup">
      <Documentation />
      <Export />
    </div>
  );
}

function Navigation() {
  return (
    <div className="bg-[#f5f5f5] relative shrink-0 w-full" data-name="Navigation">
      <div aria-hidden="true" className="absolute border-[#c4c4c4] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center w-full">
        <div className="content-stretch flex items-center justify-between pl-[24px] pr-0 py-0 relative w-full">
          <p className="font-['JetBrains_Mono:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[12px] xl:text-[14px] 2xl:text-[16px] text-black text-nowrap">BASE RAMPS</p>
          <ButtonGroup />
        </div>
      </div>
    </div>
  );
}

function Frame({ steps }: { steps: number }) {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
      {Array.from({ length: steps }).map((_, i) => (
        <LightnessScaleItemText key={i} text={String((i + 1) * 100)} />
      ))}
    </div>
  );
}

function Frame1({ min, max, steps, curve }: { min: number; max: number; steps: number; curve: Curve }) {
  const getLValue = (index: number) => {
    if (steps <= 1) return max;
    // Normalized x from 0 to 1
    const x = index / (steps - 1);

    // Get y value from bezier curve (0 to 1)
    // In our graph: 
    // Start (x=0) is Max Lightness (should be Y=0 visually, but in value logic?)
    // Let's assume curve Y=0 -> Max, Y=1 -> Min (matches SVG coord system where 0 is top/start, 1 is bottom/end)
    const curveY = getCurveY(x, curve);

    // Interpolate Lightness
    // If curveY=0 -> Max
    // If curveY=1 -> Min
    const val = max - (curveY * (max - min));
    return Math.round(Math.max(0, Math.min(100, val)));
  };

  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
      {Array.from({ length: steps }).map((_, i) => (
        <LightnessScaleItemText1 key={i} text={`L${getLValue(i)}`} />
      ))}
    </div>
  );
}

function Frame4({ min, max, steps, curve }: { min: number; max: number; steps: number; curve: Curve }) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame steps={steps} />
      <Frame1 min={min} max={max} steps={steps} curve={curve} />
    </div>
  );
}

function SystemRail({ min, max, steps, curve, isSelected }: { min: number; max: number; steps: number; curve: Curve; isSelected: boolean }) {
  return (
    <div className={`sticky top-0 z-50 relative shrink-0 w-full ${isSelected ? 'bg-[#e6e6e6]' : 'bg-[#f5f5f5]'}`} data-name="SystemRail">
      <div aria-hidden="true" className="absolute border-[#c4c4c4] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center px-[24px] py-[8px] relative w-full">
          <Frame4 min={min} max={max} steps={steps} curve={curve} />
        </div>
      </div>
    </div>
  );
}

function TrashLight() {
  return (
    <div className="relative shrink-0 size-[16px] xl:size-[18px] 2xl:size-[20px]" data-name="trash-light">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="trash-light">
          <path d={svgPaths.p2bf07e80} fill="var(--fill-0, #7A7A7A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function PaletteHeader({ name, onChange, onDelete }: { name: string; onChange?: (name: string) => void; onDelete?: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);

  useEffect(() => {
    if (!isEditing) setTempName(name);
  }, [name, isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (onChange && tempName !== name) {
      onChange(tempName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBlur();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      {isEditing ? (
        <input
          autoFocus
          onFocus={(e) => e.target.select()}
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="font-['PP_Neue_Montreal:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18180f] text-[16px] xl:text-[18px] 2xl:text-[20px] bg-transparent outline-none border-none p-0 w-full"
        />
      ) : (
        <p
          onClick={handleClick}
          className="font-['PP_Neue_Montreal:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18180f] text-[16px] xl:text-[18px] 2xl:text-[20px] text-nowrap cursor-pointer hover:underline"
        >
          {name}
        </p>
      )}
      {onDelete && (
        <div onClick={(e) => { e.stopPropagation(); onDelete(); }} className="cursor-pointer ml-4">
          <TrashLight />
        </div>
      )}
    </div>
  );
}

function Frame2({ onChange }: { onChange?: (name: string) => void }) {
  return <PaletteHeader name="Neutral" onChange={onChange} />;
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

import { generateOklchRamp, toOklch } from "./color-engine";
import { formatHex, displayable } from 'culori';

function blendWithWhite(r: number, g: number, b: number, opacity: number): [number, number, number] {
  const alpha = opacity / 100;
  const blend = (c: number) => Math.round(c * alpha + 255 * (1 - alpha));
  return [blend(r), blend(g), blend(b)];
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => c.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getLuminanceFromHex(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrast(lum1: number, lum2: number) {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getWCAGRating(ratio: number) {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "Fail";
}

function Swatch({ color, lValue, isAnchor = false }: { color: string; lValue: number; isAnchor?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(color);
    setCopied(true);
    toast("Copied HEX", {
      description: color,
      style: {
        backgroundColor: "#18180f",
        color: "#ffffff",
        border: "1px solid #333",
        borderRadius: "8px",
        fontFamily: "'PP_Neue_Montreal:Book', sans-serif"
      }
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const lum = getLuminanceFromHex(color);
  const whiteLum = 1;
  const blackLum = 0;

  const contrastWhite = getContrast(lum, whiteLum);
  const contrastBlack = getContrast(lum, blackLum);

  const bestContrast = contrastWhite > contrastBlack ? contrastWhite : contrastBlack;
  // If contrast against white is better, use white text. Else black.
  const overlayTextColor = contrastWhite > contrastBlack ? "text-white" : "text-black";
  const rating = getWCAGRating(bestContrast);

  // Determine dot color based on contrast
  const dotColor = contrastWhite > contrastBlack ? "#ffffff" : "#18180f";

  return (
    <div
      className="aspect-[179.429/179.43] basis-0 grow min-h-px min-w-px shrink-0 relative group cursor-pointer"
      style={{ backgroundColor: color }}
      data-name="ColorSwatch"
      onClick={handleCopy}
    >
      {isAnchor && (
        <div
          className="absolute rounded-full z-10"
          style={{
            width: '6px',
            height: '6px',
            top: '6px',
            left: '6px',
            backgroundColor: dotColor
          }}
          title="Anchor swatch"
        />
      )}
      <div className={`opacity-0 group-hover:opacity-100 absolute inset-0 flex flex-col justify-between p-2 transition-opacity ${overlayTextColor}`}>
        <div className="flex justify-end">
          <div onClick={handleCopy} className="cursor-pointer hover:opacity-70 p-1 rounded hover:bg-black/10">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </div>
        </div>
        <div className="flex flex-col items-start text-[10px] font-['JetBrains_Mono:Regular',sans-serif] leading-tight font-medium">
          <p>L{lValue}</p>
          <p>{bestContrast.toFixed(2)}:1</p>
          <p>{rating}</p>
        </div>
      </div>
    </div>
  );
}

function Frame3({ min, max, steps, curve, hue = 0, chroma = 0, lightness = 0.5, opacity = 100 }: { min: number; max: number; steps: number; curve: Curve; hue?: number; chroma?: number; lightness?: number; opacity?: number }) {
  const getLValue = (index: number) => {
    if (steps <= 1) return max;
    const x = index / (steps - 1);
    const curveY = getCurveY(x, curve);
    const val = max - (curveY * (max - min));
    return Math.round(Math.max(0, Math.min(100, val)));
  };

  const railLightnesses = Array.from({ length: steps }).map((_, i) => getLValue(i));
  const { colors: rampColors, warning, anchorIndex } = generateOklchRamp(hue, chroma, lightness, railLightnesses);


  return (
    <div className="w-full">
      {warning && (
        <div className="mb-[8px] px-[8px] py-[6px] bg-[#fff3cd] border border-[#ffc107] rounded-[4px]">
          <p className="font-['JetBrains_Mono:Regular',sans-serif] text-[10px] xl:text-[11px] 2xl:text-[12px] text-[#856404] leading-[normal]">
            ⚠ Color adjusted to fit system constraints.
          </p>
        </div>
      )}
      <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
        {rampColors.map((colorHex, i) => {
          const l = railLightnesses[i];

          // Handle opacity blending
          const [r, g, b] = hexToRgb(colorHex);
          const [r2, g2, b2] = blendWithWhite(r, g, b, opacity);
          const finalColor = rgbToHex(r2, g2, b2);

          return (
            <Swatch key={i} color={finalColor} lValue={l} isAnchor={i === anchorIndex} />
          );
        })}
      </div>
    </div>
  );
}

function AddRampButton({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="content-stretch flex items-center justify-center py-[24px] relative shrink-0 w-full cursor-pointer hover:bg-[#f5f5f5] transition-colors group"
      data-name="AddRamp"
    >
      <div className="flex items-center gap-[8px] opacity-50 group-hover:opacity-100 transition-opacity">
        <Plus />
        <p className="font-['PP_Neue_Montreal:Book',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18180f] text-[12px] xl:text-[14px] 2xl:text-[16px] text-nowrap">Add Ramp</p>
      </div>
    </div>
  );
}

function PaletteRow({
  id,
  name,
  min,
  max,
  steps,
  curve,
  hue,
  chroma,
  lightness,
  opacity,
  isSelected,
  onSelect,
  onChange,
  onDelete
}: {
  id: string;
  name: string;
  min: number;
  max: number;
  steps: number;
  curve: Curve;
  hue: number;
  chroma: number;
  lightness: number;
  opacity: number;
  isSelected: boolean;
  onSelect: () => void;
  onChange?: (name: string) => void;
  onDelete?: () => void;
}) {
  return (
    <div
      className={`relative shrink-0 w-full cursor-pointer transition-colors ${isSelected ? 'bg-[#f0f0f0]' : 'hover:bg-[#fafafa]'}`}
      data-name="PaletteRow"
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col gap-[8px] items-start justify-center px-[24px] pt-[6px] pb-[12px] relative w-full">
          <PaletteHeader name={name} onChange={onChange} onDelete={onDelete} />
          <Frame3 min={min} max={max} steps={steps} curve={curve} hue={hue} chroma={chroma} lightness={lightness} opacity={opacity} />
        </div>
      </div>
    </div>
  );
}

function Neutral({ min, max, steps, curve, isSelected, onSelect, onChange }: {
  min: number;
  max: number;
  steps: number;
  curve: Curve;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (name: string) => void;
}) {
  return (
    <div className="w-full">
      <PaletteRow
        id="neutral"
        name="Neutral"
        min={min}
        max={max}
        steps={steps}
        curve={curve}
        hue={0}
        chroma={0}
        lightness={50}
        opacity={100}
        isSelected={isSelected}
        onSelect={onSelect}
        onChange={onChange}
      />
    </div>
  );
}

function Palettes({
  min,
  max,
  steps,
  curve,
  palettes,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onPaletteChange
}: {
  min: number;
  max: number;
  steps: number;
  curve: Curve;
  palettes: Array<PaletteData>;
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onPaletteChange: (id: string, updates: Partial<PaletteData>) => void;
}) {
  return (
    <div className="content-stretch flex flex-col items-start px-0 pb-[8px] relative shrink-0 w-full" data-name="Palettes">
      <div className="w-full pt-[8px]">
        <Neutral
          min={min}
          max={max}
          steps={steps}
          curve={curve}
          isSelected={selectedId === 'neutral'}
          onSelect={() => onSelect('neutral')}
          onChange={(name) => onPaletteChange('neutral', { name })}
        />
      </div>
      {palettes.map((palette) => (
        <PaletteRow
          key={palette.id}
          id={palette.id}
          name={palette.name}
          min={min}
          max={max}
          steps={steps}
          curve={curve}
          hue={palette.hue}
          chroma={palette.chroma}
          lightness={palette.lightness}
          opacity={palette.opacity}
          isSelected={selectedId === palette.id}
          onSelect={() => onSelect(palette.id)}
          onChange={(name) => onPaletteChange(palette.id, { name })}
          onDelete={() => onDelete(palette.id)}
        />
      ))}
      <AddRampButton onClick={onAdd} />
    </div>
  );
}

function PaletteArea({
  min,
  max,
  steps,
  curve,
  palettes,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onPaletteChange
}: {
  min: number;
  max: number;
  steps: number;
  curve: Curve;
  palettes: Array<PaletteData>;
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onPaletteChange: (id: string, updates: Partial<PaletteData>) => void;
}) {
  return (
    <div
      className="content-stretch flex flex-col flex-1 items-start relative w-full overflow-auto"
      data-name="PaletteArea"
      onClick={() => onSelect('system')}
    >
      <div
        onClick={(e) => { e.stopPropagation(); onSelect('system'); }}
        className={`w-full cursor-pointer sticky top-0 z-50 ${selectedId === 'system' ? 'bg-[#e6e6e6]' : 'bg-[#f5f5f5]'}`}
      >
        <SystemRail min={min} max={max} steps={steps} curve={curve} isSelected={selectedId === 'system'} />
      </div>
      <Palettes
        min={min}
        max={max}
        steps={steps}
        curve={curve}
        palettes={palettes}
        selectedId={selectedId}
        onSelect={onSelect}
        onAdd={onAdd}
        onDelete={onDelete}
        onPaletteChange={onPaletteChange}
      />
    </div>
  );
}

function Main({
  min,
  max,
  steps,
  curve,
  palettes,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onPaletteChange
}: {
  min: number;
  max: number;
  steps: number;
  curve: Curve;
  palettes: Array<PaletteData>;
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onPaletteChange: (id: string, updates: Partial<PaletteData>) => void;
}) {
  return (
    <div className="content-stretch flex flex-col flex-1 items-start relative h-screen overflow-hidden" data-name="Main">
      <Navigation />
      <PaletteArea
        min={min}
        max={max}
        steps={steps}
        curve={curve}
        palettes={palettes}
        selectedId={selectedId}
        onSelect={onSelect}
        onAdd={onAdd}
        onDelete={onDelete}
        onPaletteChange={onPaletteChange}
      />
    </div>
  );
}

function FaviconUpdater({ min, max, steps, curve, selectedPalette }: {
  min: number;
  max: number;
  steps: number;
  curve: Curve;
  selectedPalette: PaletteData | undefined;
}) {
  useEffect(() => {
    if (!selectedPalette) return;

    const getLValue = (index: number) => {
      if (steps <= 1) return max;
      const x = index / (steps - 1);
      const curveY = getCurveY(x, curve);
      const val = max - (curveY * (max - min));
      return Math.round(Math.max(0, Math.min(100, val)));
    };

    const railLightnesses = Array.from({ length: steps }).map((_, i) => getLValue(i));

    const { colors } = generateOklchRamp(
      selectedPalette.hue,
      selectedPalette.chroma,
      selectedPalette.lightness,
      railLightnesses
    );

    let maxChroma = -1;
    let maxChromaColor = colors[0];

    colors.forEach(hex => {
      const oklchColor = toOklch(hex);
      if (oklchColor && oklchColor.c !== undefined && oklchColor.c > maxChroma) {
        maxChroma = oklchColor.c;
        maxChromaColor = hex;
      }
    });

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = maxChromaColor;
      ctx.fillRect(0, 0, 32, 32);

      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        document.head.appendChild(link);
      }
      link.href = canvas.toDataURL();
    }

  }, [min, max, steps, curve, selectedPalette]);

  return null;
}

function Global() {
  const [range, setRange] = useState({ min: 5, max: 95 });
  const [steps, setSteps] = useState(7);
  // Default to Linear (0,0, 1,1)
  const [curve, setCurve] = useState<Curve>({ x1: 0.5, y1: 0.5, x2: 0.5, y2: 0.5 });
  const [palettes, setPalettes] = useState<Array<PaletteData>>([]);
  const [neutralPalette, setNeutralPalette] = useState<PaletteData>({
    id: 'neutral',
    name: 'Neutral',
    hue: 0,
    chroma: 0,
    lightness: 50,
    opacity: 100
  });
  const [selectedId, setSelectedId] = useState<string>('system');

  const handleRangeChange = (newMin: number, newMax: number) => {
    setRange({ min: newMin, max: newMax });
  };

  const handleStepsChange = (newSteps: number) => {
    setSteps(newSteps);
  };

  const handleCurveChange = (newCurve: Curve) => {
    setCurve(newCurve);
  };

  const handleAddPalette = () => {
    const newId = `palette-${Date.now()}`;
    const lastPalette = palettes[palettes.length - 1];

    const newPalette: PaletteData = {
      id: newId,
      name: "New Ramp",
      hue: lastPalette?.hue ?? 0,
      chroma: lastPalette?.chroma ?? 0.1,
      lightness: lastPalette?.lightness ?? 0.5,
      opacity: lastPalette?.opacity ?? 100
    };
    setPalettes([...palettes, newPalette]);
    setSelectedId(newId);
  };

  const handleDeletePalette = (id: string) => {
    setPalettes(palettes.filter(p => p.id !== id));
    if (selectedId === id) {
      setSelectedId('system');
    }
  };

  const handlePaletteChange = (id: string, updates: Partial<PaletteData>) => {
    if (id === 'neutral') {
      setNeutralPalette(prev => ({ ...prev, ...updates }));
    } else {
      setPalettes(palettes.map(p => p.id === id ? { ...p, ...updates } : p));
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const selectedPalette = selectedId === 'neutral' ? neutralPalette : palettes.find(p => p.id === selectedId);

  return (
    <div className="flex items-start w-full h-screen" data-name="Global">
      <ControlPanel
        min={range.min}
        max={range.max}
        steps={steps}
        curve={curve}
        onRangeChange={handleRangeChange}
        onStepsChange={handleStepsChange}
        onCurveChange={handleCurveChange}
        selectedId={selectedId}
        selectedPalette={selectedPalette}
        onPaletteChange={handlePaletteChange}
      />
      <Main
        min={range.min}
        max={range.max}
        steps={steps}
        curve={curve}
        palettes={palettes}
        selectedId={selectedId}
        onSelect={handleSelect}
        onAdd={handleAddPalette}
        onDelete={handleDeletePalette}
        onPaletteChange={handlePaletteChange}
      />
      <FaviconUpdater
        min={range.min}
        max={range.max}
        steps={steps}
        curve={curve}
        selectedPalette={selectedPalette}
      />
    </div>
  );
}

export default function Desktop() {
  return (
    <div className="bg-white relative size-full overflow-hidden" data-name="Desktop">
      <Global />
      <Toaster position="bottom-center" />
    </div>
  );
}