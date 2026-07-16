# Tally brand asset package

## What's inside

### /master
`tally-icon-master-1024.png` — the source file. 1024×1024, transparent PNG, RGBA.
This is the icon exactly as uploaded, used to generate every export below.

**Note on vector source:** the icon itself was supplied as a raster PNG, not an
SVG/Figma/Illustrator file. Every icon export below is a resize of that raster,
so quality is excellent down to small sizes but there's no true vector outline
for the bar-chart glyph. If you have (or can get) the original vector artwork,
swap it in and re-run the same export sizes for the sharpest possible result at
very small sizes (16px, 24px). The wordmark, by contrast, IS true vector —
built from font outlines — so it's provided as scalable SVG/PDF as requested.

### /ios — App Store & iOS sizes
20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024 px

### /android — launcher icon sizes
48, 72, 96, 144, 192, 512 px (512 = Google Play listing size)

### /macos
16, 32, 64, 128, 256, 512, 1024 px, plus `tally-icon.icns` — a single bundled
multi-resolution file macOS uses natively for app icons.

### /windows
16, 24, 32, 48, 64, 128, 256 px, plus `tally-icon.ico` — a single bundled
multi-resolution file for Windows executables/shortcuts.

### /web
32, 48, 64, 96, 128, 180 (Apple touch icon), 192, 512 px, plus `favicon.ico`
(bundled 16/32/48 in one file — drop straight into your site root).

### /brand — brand assets
- `tally-icon-transparent-1024.png` — transparent app icon (same as master)
- `tally-icon-on-white-1024.png` — icon on a white card, for light-context use
- `tally-icon-on-dark-1024.png` — icon on a near-black card, for dark-context use
- `tally-logomark-2048.png` / `.pdf` — the icon graphic at high-res, for print/large use
- `favicon-16/32/48.png` — loose favicon sizes if you need them unbundled
- `tally-lockup-horizontal-blue.png` — icon + wordmark side by side, for nav bars/headers
- `tally-social-preview-1200x630.png` — Open Graph / Twitter card image

### /wordmark — the "TALLY" wordmark
Built as true vector from font outlines (Poppins Bold, tightened tracking for
a premium, confident feel — pairs with the icon's geometric rounded shapes).

- `tally-wordmark-{blue|white|dark|black}.svg` — vector source, infinitely scalable
- `tally-wordmark-{blue|white|dark|black}.pdf` — vector, for print/design tools
- `tally-wordmark-{color}-{small|medium|large|xlarge|giant}-{width}px.png` —
  pre-rendered transparent PNGs at 400 / 800 / 1600 / 2400 / 4000px wide,
  in case you need a raster instead of SVG (e.g. for tools that don't take SVG)

**Color guide:**
- **blue** (`#0AA7FF`) — primary, use on white/light backgrounds
- **white** — use on dark backgrounds (nav bars, dark footers)
- **dark** (`#212220`) — use on light backgrounds for a quieter, text-like mark
- **black** — pure black, for print or high-contrast contexts

**Giant footer wordmark:** use `tally-wordmark-{color}-giant-4000px.png` for the
oversized "TALLY" footer treatment (à la Stripe/Linear footers) — or better,
use the `.svg` directly in code so it stays crisp at any width, including
full-bleed hero-sized treatments.

## Quick reference for common integrations

- **Website favicon:** `web/favicon.ico`
- **PWA manifest:** `web/icon-192.png` and `web/icon-512.png`
- **Apple touch icon:** `web/icon-180.png`
- **iOS Xcode asset catalog:** everything in `/ios`
- **Android `res/mipmap-*` folders:** everything in `/android`
- **Electron/desktop app (macOS):** `macos/tally-icon.icns`
- **Electron/desktop app (Windows):** `windows/tally-icon.ico`
- **Footer wordmark on a website:** `wordmark/tally-wordmark-white.svg` (dark
  footer) or `wordmark/tally-wordmark-dark.svg` (light footer)
