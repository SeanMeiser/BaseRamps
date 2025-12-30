# Changelog

All notable changes to BaseRamps will be documented in this file.

---

## [0.7.0] — 2024-12-30

### 🎉 First Public Release

**A System-First OKLCH Color Palette Generator**

BaseRamps is a structural approach to color palette generation. Unlike generative tools that build scales around a picked color, BaseRamps enforces a rigid lightness structure (the "Rail") that colors must inhabit—ensuring **functional symmetry** across your entire design system.

### ✨ Core Features

#### 🎨 Perceptually Uniform Color Generation
- **OKLCH Color Space** — Built on OKLCH for true perceptual uniformity powered by [Culori](https://culorijs.org/)
- **Global Lightness Rail** — Define lightness values once; all palettes adhere to the same structure
- **Snap-to-Scale Logic** — Input any hex code and automatically snap to the nearest valid lightness step
- **Anchor Indicator** — Visual dot marks which swatch represents your input color

#### ⚙️ System Controls
- **Adjustable Min/Max Lightness** — Interactive dual-handle slider for lightness range
- **Configurable Steps** — Set the number of swatches (1-20) per ramp
- **Bezier Curve Distribution** — Fine-tune lightness easing with presets:
  - Uniform (linear)
  - Mid-Tone Focus
  - Shade Focus
  - Tint Focus

#### 🔬 Color Science
- **Gamut Protection** — sRGB gamut mapping preserves lightness, preventing "neon clipping" artifacts
- **Warmth Correction** — Automatic hue rotation for dark yellows/oranges to prevent muddy olive/green output
- **Contrast Locking** — If Step 500 passes AA, *all* Step 500s pass AA across your palette

#### 🖌️ Color Picker
- **2D OKLCH Picker** — Direct chroma × lightness selection plane
- **Hue Slider** — Full 360° hue selection
- **Opacity Control** — Alpha channel support per ramp
- **Hex Input** — Direct hex code entry with real-time conversion

#### 📦 Export Options
- **Tailwind Config** — Direct `theme.extend.colors` output
- **CSS Variables** — `:root` custom properties
- **Raw JSON** — Design token format

#### 🎛️ Palette Management
- **Multiple Ramps** — Add, remove, and rename unlimited color ramps
- **Dedicated Neutral Row** — Built-in grayscale ramp for neutrals
- **Ramp Selection** — Click to edit individual ramps in the control panel
- **Dynamic Favicon** — Tab icon reflects your palette's most saturated color

---

**Full Changelog**: This is the first public release.
