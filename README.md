# Lightness Lock

**A System-First OKLCH Color Palette Generator.**

Most color tools are *generative*: you pick a color, and they generate a scale around it.
**Lightness Lock** is *structural*: you define a rigid Lightness structure (the "Rail"), and force colors to inhabit it.

![Project Screenshot](./public/screenshot.png)

## 📐 The Philosophy

In modern design systems, **Perceptual Uniformity** is not enough. We need **Functional Symmetry**.

If `Blue-500` and `Yellow-500` share the same token name, they should function identically in the UI. They should have the exact same contrast ratio against white.

Standard tools fail at this because they preserve the input color at the cost of the system structure (often forcing a bright yellow into a "mid-tone" slot, breaking accessibility).

**Lightness Lock solves this by:**
1.  **Defining the Rail:** A global source of truth for Lightness values (e.g., `L-98`, `L-50`, `L-10`).
2.  **Snapping Inputs:** When you input a color, the system calculates its lightness and "snaps" it to the nearest valid step on the rail.
3.  **Interpolating:** The rest of the palette is generated relative to that snapped anchor, ensuring strict adherence to the global lightness curve.

## ✨ Features

* **Global Lightness Rail:** Change the system physics once (e.g., adjust the easing curve), and every palette updates instantly.
* **Snap-to-Scale Logic:** Input any hex code, and the tool automatically assigns it to the correct lightness step.
* **Gamut Protection:** Uses `culori`'s Oklch-to-RGB gamut mapping to prevent "neon clipping" artifacts while prioritizing lightness preservation.
* **Warmth Shield:** Automatically rotates Yellow/Orange hues toward Red in darker shades to prevent the "olive/mud" effect common in algorithmic palettes.
* **Contrast Locking:** Calculate accessibility once. If Step 500 passes AA, *all* Step 500s pass AA.
* **Bezier Distribution:** Custom "Signal Visualizer" to tune the easing of your lightness steps (Linear, Ease-In, Ease-Out).
* **Smart Export:** One-click generation of:
    * Tailwind Config (`theme.extend.colors`)
    * CSS Variables (`:root`)
    * Raw JSON tokens

## 🛠️ Tech Stack

* **Framework:** React + Vite
* **State Management:** Zustand (Separating System Settings from Palette State)
* **Color Math:** [Culori](https://culorijs.org/)
* **Styling:** Tailwind CSS + clsx
* **Easing:** `bezier-easing`

## 🚀 Getting Started

### Prerequisites
* Node.js 18+

### Installation

```bash
# 1. Clone the repository
git clone [https://github.com/SeanMeiser/BaseRamps)

# 2. Open it in your favorite code editor

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev