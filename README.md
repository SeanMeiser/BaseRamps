# BaseRamps

**A System-First OKLCH Color Palette Generator**

Most color tools are *generative*: you pick a color, and they generate a scale around it.  
**BaseRamps** is *structural*: you define a rigid lightness structure (the "Rail"), and force colors to inhabit it.

![BaseRamps Screenshot](./public/screenshot.png)

---

## 📐 The Philosophy

In modern design systems, **Perceptual Uniformity** is not enough. We need **Functional Symmetry**.

If `Blue-500` and `Yellow-500` share the same token name, they should function identically in the UI—with the exact same contrast ratio against white.

Standard tools fail at this because they preserve the input color at the cost of system structure (often forcing a bright yellow into a "mid-tone" slot, breaking accessibility).

**BaseRamps solves this by:**

1. **Defining the Rail** — A global source of truth for lightness values (e.g., `L-98`, `L-50`, `L-10`)
2. **Snapping Inputs** — When you input a color, the system calculates its lightness and snaps it to the nearest valid step
3. **Interpolating** — The rest of the palette generates relative to that anchor, ensuring strict adherence to the global lightness curve

---

## ✨ Features

### Color Generation
- **OKLCH Color Space** — True perceptual uniformity powered by [Culori](https://culorijs.org/)
- **Global Lightness Rail** — Change the system physics once, and every palette updates instantly
- **Snap-to-Scale Logic** — Input any hex code; the tool automatically assigns it to the correct lightness step
- **Anchor Indicator** — Visual marker showing which swatch represents your input color

### Color Science
- **Gamut Protection** — sRGB gamut mapping prevents "neon clipping" while prioritizing lightness preservation
- **Warmth Correction** — Automatically rotates yellow/orange hues toward red in darker shades to prevent the "olive/mud" effect
- **Contrast Locking** — Calculate accessibility once. If Step 500 passes AA, *all* Step 500s pass AA

### System Controls
- **Adjustable Lightness Range** — Interactive dual-handle slider for min/max lightness
- **Configurable Steps** — 1–20 swatches per ramp
- **Bezier Curve Distribution** — Presets for Uniform, Mid-Tone Focus, Shade Focus, and Tint Focus

### Export
- **Tailwind Config** — `theme.extend.colors` output
- **CSS Variables** — `:root` custom properties
- **Raw JSON** — Design token format

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React + Vite |
| State | Zustand |
| Color Math | [Culori](https://culorijs.org/) |
| Styling | Tailwind CSS |
| Easing | `bezier-easing` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+

### Installation

```bash
# Clone the repository
git clone https://github.com/SeanMeiser/BaseRamps

# Navigate to the directory
cd BaseRamps

# Install dependencies
npm install

# Start the development server
npm run dev
```

---

## 📄 License

MIT

---

## 🙏 Acknowledgments

- [Culori](https://culorijs.org/) for OKLCH color math
- [Radix UI](https://www.radix-ui.com/) for accessible primitives