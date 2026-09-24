import { RGBAColor, HSLColor, NormalizedColor, ColorExports } from '../types/color';

// Clamp number within range
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

// Round to given decimal places
export function roundTo(val: number, decimals: number = 3): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

// Convert 0-255 component to 2-digit Hex
export function componentToHex(c: number): string {
  const hex = Math.round(clamp(c, 0, 255)).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

// RGBA to standard 6-character Hex (#RRGGBB)
export function rgbaToHex(rgba: RGBAColor): string {
  return `#${componentToHex(rgba.r)}${componentToHex(rgba.g)}${componentToHex(rgba.b)}`.toUpperCase();
}

// RGBA to 8-character Hex (#RRGGBBAA)
export function rgbaToHex8(rgba: RGBAColor): string {
  const alpha255 = Math.round(clamp(rgba.a, 0, 1) * 255);
  return `#${componentToHex(rgba.r)}${componentToHex(rgba.g)}${componentToHex(rgba.b)}${componentToHex(alpha255)}`.toUpperCase();
}

// RGBA to Normalized 0.0 - 1.0
export function rgbaToNormalized(rgba: RGBAColor): NormalizedColor {
  return {
    r: roundTo(clamp(rgba.r, 0, 255) / 255, 4),
    g: roundTo(clamp(rgba.g, 0, 255) / 255, 4),
    b: roundTo(clamp(rgba.b, 0, 255) / 255, 4),
    a: roundTo(clamp(rgba.a, 0, 1), 4),
  };
}

// Normalized 0.0 - 1.0 to RGBA
export function normalizedToRgba(norm: NormalizedColor): RGBAColor {
  return {
    r: Math.round(clamp(norm.r, 0, 1) * 255),
    g: Math.round(clamp(norm.g, 0, 1) * 255),
    b: Math.round(clamp(norm.b, 0, 1) * 255),
    a: roundTo(clamp(norm.a, 0, 1), 3),
  };
}

// RGBA to 24-bit Decimal Integer: (R << 16) | (G << 8) | B
export function rgbaToDecimal24(rgba: RGBAColor): number {
  return ((Math.round(rgba.r) & 0xff) << 16) | ((Math.round(rgba.g) & 0xff) << 8) | (Math.round(rgba.b) & 0xff);
}

// RGBA to 32-bit ARGB unsigned decimal integer
export function rgbaToDecimal32Argb(rgba: RGBAColor): number {
  const a = Math.round(clamp(rgba.a, 0, 1) * 255) & 0xff;
  const r = Math.round(rgba.r) & 0xff;
  const g = Math.round(rgba.g) & 0xff;
  const b = Math.round(rgba.b) & 0xff;
  return (((a << 24) | (r << 16) | (g << 8) | b) >>> 0);
}

// 24-bit Decimal Integer to RGBA
export function decimal24ToRgba(dec: number, alpha: number = 1): RGBAColor {
  const safeDec = Math.max(0, Math.floor(dec)) & 0xffffff;
  return {
    r: (safeDec >> 16) & 0xff,
    g: (safeDec >> 8) & 0xff,
    b: safeDec & 0xff,
    a: roundTo(clamp(alpha, 0, 1), 3),
  };
}

// RGBA to HSL
export function rgbaToHsl(rgba: RGBAColor): HSLColor {
  const r = clamp(rgba.r, 0, 255) / 255;
  const g = clamp(rgba.g, 0, 255) / 255;
  const b = clamp(rgba.b, 0, 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: roundTo(clamp(rgba.a, 0, 1), 3),
  };
}

// HSL to RGBA
export function hslToRgba(hsl: HSLColor): RGBAColor {
  const h = (hsl.h % 360 + 360) % 360 / 360;
  const s = clamp(hsl.s, 0, 100) / 100;
  const l = clamp(hsl.l, 0, 100) / 100;

  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val, a: roundTo(clamp(hsl.a, 0, 1), 3) };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: roundTo(clamp(hsl.a, 0, 1), 3),
  };
}

// Generate all code export formats for a color
export function getColorExports(rgba: RGBAColor): ColorExports {
  const hex = rgbaToHex(rgba);
  const hex8 = rgbaToHex8(rgba);
  const norm = rgbaToNormalized(rgba);
  const hsl = rgbaToHsl(rgba);
  const dec24 = rgbaToDecimal24(rgba);
  const dec32 = rgbaToDecimal32Argb(rgba);

  const aFormatted = rgba.a === 1 ? '1' : rgba.a === 0 ? '0' : rgba.a.toFixed(2).replace(/\.?0+$/, '');
  const rgbaCss = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${aFormatted})`;
  const rgbaModern = `rgb(${rgba.r} ${rgba.g} ${rgba.b} / ${Math.round(rgba.a * 100)}%)`;

  const normR = norm.r.toFixed(3);
  const normG = norm.g.toFixed(3);
  const normB = norm.b.toFixed(3);
  const normA = norm.a.toFixed(3);

  return {
    hex,
    hex8,
    rgbaCss,
    rgbaModern,
    normalizedArray: `[${normR}, ${normG}, ${normB}, ${normA}]`,
    normalizedVec4: `vec4(${normR}, ${normG}, ${normB}, ${normA})`,
    swiftUi: `Color(red: ${normR}, green: ${normG}, blue: ${normB}, opacity: ${normA})`,
    unityColor: `new Color(${normR}f, ${normG}f, ${normB}f, ${normA}f)`,
    decimalRgb: `${rgba.r}, ${rgba.g}, ${rgba.b}`,
    decimalInt24: dec24,
    decimalInt32: dec32,
    hslaCss: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${aFormatted})`,
  };
}

// WCAG Relative Luminance
export function getRelativeLuminance(rgba: RGBAColor): number {
  const sRGB = [rgba.r, rgba.g, rgba.b].map((v) => {
    const val = v / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

// WCAG Contrast Ratio
export function getContrastRatio(rgba1: RGBAColor, rgba2: RGBAColor): number {
  const l1 = getRelativeLuminance(rgba1);
  const l2 = getRelativeLuminance(rgba2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return roundTo((lighter + 0.05) / (darker + 0.05), 2);
}

// Contrast score details vs Black & White
export function getContrastInfo(rgba: RGBAColor) {
  // Composite with white background if transparent
  const effR = Math.round(rgba.r * rgba.a + 255 * (1 - rgba.a));
  const effG = Math.round(rgba.g * rgba.a + 255 * (1 - rgba.a));
  const effB = Math.round(rgba.b * rgba.a + 255 * (1 - rgba.a));
  const compositeRgba = { r: effR, g: effG, b: effB, a: 1 };

  const onWhite = getContrastRatio(compositeRgba, { r: 255, g: 255, b: 255, a: 1 });
  const onBlack = getContrastRatio(compositeRgba, { r: 0, g: 0, b: 0, a: 1 });
  const preferredText = onBlack > onWhite ? '#FFFFFF' : '#0F172A';

  return {
    onWhite,
    onBlack,
    preferredText,
    isWcagAa: onWhite >= 4.5 || onBlack >= 4.5,
    isWcagAaa: onWhite >= 7 || onBlack >= 7,
  };
}

// Common CSS Named Colors map
const CSS_NAMED_COLORS: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  red: '#ff0000',
  green: '#008000',
  blue: '#0000ff',
  yellow: '#ffff00',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  purple: '#800080',
  orange: '#ffa500',
  coral: '#ff7f50',
  tomato: '#ff6347',
  gold: '#ffd700',
  silver: '#c0c0c0',
  gray: '#808080',
  grey: '#808080',
  pink: '#ffc0cb',
  teal: '#008080',
  navy: '#000080',
  indigo: '#4b0082',
  violet: '#ee82ee',
  crimson: '#dc143c',
  lime: '#00ff00',
  aqua: '#00ffff',
  azure: '#f0ffff',
  salmon: '#fa8072',
  skyblue: '#87ceeb',
  rebeccapurple: '#663399',
};

// Smart string parser that auto-detects format
export function parseColorString(input: string): RGBAColor | null {
  if (!input) return null;
  const str = input.trim();

  // 1. Check CSS named color
  const lower = str.toLowerCase();
  if (CSS_NAMED_COLORS[lower]) {
    return parseColorString(CSS_NAMED_COLORS[lower]);
  }

  // 2. Hex formats: #RGB, #RGBA, #RRGGBB, #RRGGBBAA, 0xRRGGBB, or raw hex without hash
  const hexPattern = /^(?:#|0x)?([0-9a-fA-F]{3,8})$/;
  const hexMatch = str.match(hexPattern);
  if (hexMatch) {
    const raw = hexMatch[1];
    if (raw.length === 3) {
      // #RGB
      const r = parseInt(raw[0] + raw[0], 16);
      const g = parseInt(raw[1] + raw[1], 16);
      const b = parseInt(raw[2] + raw[2], 16);
      return { r, g, b, a: 1 };
    }
    if (raw.length === 4) {
      // #RGBA
      const r = parseInt(raw[0] + raw[0], 16);
      const g = parseInt(raw[1] + raw[1], 16);
      const b = parseInt(raw[2] + raw[2], 16);
      const a = parseInt(raw[3] + raw[3], 16) / 255;
      return { r, g, b, a: roundTo(a, 3) };
    }
    if (raw.length === 6) {
      // #RRGGBB
      const r = parseInt(raw.substring(0, 2), 16);
      const g = parseInt(raw.substring(2, 4), 16);
      const b = parseInt(raw.substring(4, 6), 16);
      return { r, g, b, a: 1 };
    }
    if (raw.length === 8) {
      // #RRGGBBAA
      const r = parseInt(raw.substring(0, 2), 16);
      const g = parseInt(raw.substring(2, 4), 16);
      const b = parseInt(raw.substring(4, 6), 16);
      const a = parseInt(raw.substring(6, 8), 16) / 255;
      return { r, g, b, a: roundTo(a, 3) };
    }
  }

  // 3. rgba(r, g, b, a) or rgb(r, g, b) or rgb(r g b / a)
  const rgbPattern = /^rgba?\s*\(\s*([\d.]+)(?:%?)[,\s]+([\d.]+)(?:%?)[,\s]+([\d.]+)(?:%?)(?:[,\s/]+([\d.]+)(%?))?\s*\)$/i;
  const rgbMatch = str.match(rgbPattern);
  if (rgbMatch) {
    let r = parseFloat(rgbMatch[1]);
    let g = parseFloat(rgbMatch[2]);
    let b = parseFloat(rgbMatch[3]);
    let a = rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1;

    if (rgbMatch[5] === '%') {
      a = a / 100;
    }
    return {
      r: clamp(Math.round(r), 0, 255),
      g: clamp(Math.round(g), 0, 255),
      b: clamp(Math.round(b), 0, 255),
      a: clamp(roundTo(a, 3), 0, 1),
    };
  }

  // 4. Swift Color(red: r, green: g, blue: b, opacity: a)
  const swiftPattern = /Color\s*\(\s*red:\s*([\d.]+)\s*,\s*green:\s*([\d.]+)\s*,\s*blue:\s*([\d.]+)(?:\s*,\s*opacity:\s*([\d.]+))?\s*\)/i;
  const swiftMatch = str.match(swiftPattern);
  if (swiftMatch) {
    const r = parseFloat(swiftMatch[1]);
    const g = parseFloat(swiftMatch[2]);
    const b = parseFloat(swiftMatch[3]);
    const a = swiftMatch[4] !== undefined ? parseFloat(swiftMatch[4]) : 1;
    return normalizedToRgba({ r, g, b, a });
  }

  // 5. Unity new Color(r, g, b, a)
  const unityPattern = /Color\s*\(\s*([\d.]+)f?\s*,\s*([\d.]+)f?\s*,\s*([\d.]+)f?(?:\s*,\s*([\d.]+)f?)?\s*\)/i;
  const unityMatch = str.match(unityPattern);
  if (unityMatch) {
    const r = parseFloat(unityMatch[1]);
    const g = parseFloat(unityMatch[2]);
    const b = parseFloat(unityMatch[3]);
    const a = unityMatch[4] !== undefined ? parseFloat(unityMatch[4]) : 1;
    return normalizedToRgba({ r, g, b, a });
  }

  // 6. vec3/vec4(r, g, b, [a]) or array [r, g, b, a]
  const vecArrayPattern = /^(?:vec[34]\s*)?[(\[]\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*[)\]]$/i;
  const vecMatch = str.match(vecArrayPattern);
  if (vecMatch) {
    const c1 = parseFloat(vecMatch[1]);
    const c2 = parseFloat(vecMatch[2]);
    const c3 = parseFloat(vecMatch[3]);
    const c4 = vecMatch[4] !== undefined ? parseFloat(vecMatch[4]) : 1;

    // Determine if normalized (all <= 1.0) or 0-255
    if (c1 <= 1.0 && c2 <= 1.0 && c3 <= 1.0 && c4 <= 1.0) {
      return normalizedToRgba({ r: c1, g: c2, b: c3, a: c4 });
    } else {
      return {
        r: clamp(Math.round(c1), 0, 255),
        g: clamp(Math.round(c2), 0, 255),
        b: clamp(Math.round(c3), 0, 255),
        a: clamp(roundTo(c4 > 1 ? c4 / 255 : c4, 3), 0, 1),
      };
    }
  }

  // 7. Simple comma or space separated: "255, 99, 71" or "255, 99, 71, 0.8" or "0.5, 0.2, 0.8"
  const separated = str.split(/[,\s]+/).filter(Boolean);
  if (separated.length >= 3 && separated.length <= 4) {
    const numbers = separated.map(Number);
    if (numbers.every((n) => !isNaN(n))) {
      // Check if all are <= 1.0 (normalized)
      const isNorm = numbers.every((n) => n >= 0 && n <= 1.0);
      if (isNorm && numbers.some((n) => n > 0 && n < 1.0)) {
        return normalizedToRgba({
          r: numbers[0],
          g: numbers[1],
          b: numbers[2],
          a: numbers[3] !== undefined ? numbers[3] : 1,
        });
      } else {
        return {
          r: clamp(Math.round(numbers[0]), 0, 255),
          g: clamp(Math.round(numbers[1]), 0, 255),
          b: clamp(Math.round(numbers[2]), 0, 255),
          a: numbers[3] !== undefined ? clamp(roundTo(numbers[3] > 1 ? numbers[3] / 255 : numbers[3], 3), 0, 1) : 1,
        };
      }
    }
  }

  // 8. Single decimal integer (e.g. 16737095)
  if (/^\d{5,10}$/.test(str)) {
    const intVal = parseInt(str, 10);
    if (intVal <= 16777215) {
      return decimal24ToRgba(intVal);
    } else if (intVal <= 4294967295) {
      // ARGB or RGBA 32-bit
      const a = ((intVal >>> 24) & 0xff) / 255;
      const r = (intVal >>> 16) & 0xff;
      const g = (intVal >>> 8) & 0xff;
      const b = intVal & 0xff;
      return { r, g, b, a: roundTo(a, 3) };
    }
  }

  // 9. hsla(h, s%, l%, a)
  const hslPattern = /^hsla?\s*\(\s*([\d.]+)(?:deg)?[,\s]+([\d.]+)%?[,\s]+([\d.]+)%?(?:[,\s/]+([\d.]+)(%?))?\s*\)$/i;
  const hslMatch = str.match(hslPattern);
  if (hslMatch) {
    const h = parseFloat(hslMatch[1]);
    const s = parseFloat(hslMatch[2]);
    const l = parseFloat(hslMatch[3]);
    let a = hslMatch[4] !== undefined ? parseFloat(hslMatch[4]) : 1;
    if (hslMatch[5] === '%') a = a / 100;
    return hslToRgba({ h, s, l, a });
  }

  return null;
}

// Batch extract up to 5 colors from pasted text block
export function extractMultipleColors(text: string): RGBAColor[] {
  if (!text) return [];

  const foundColors: RGBAColor[] = [];
  
  // Try line by line or comma separation first
  const lines = text
    .split(/[\r\n;]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (foundColors.length >= 5) break;

    // Check if line contains JSON array or comma separated tokens
    const single = parseColorString(line);
    if (single) {
      foundColors.push(single);
      continue;
    }

    // Try finding hex tokens within the line
    const hexMatches = line.match(/#[0-9a-fA-F]{3,8}\b/g);
    if (hexMatches) {
      for (const h of hexMatches) {
        if (foundColors.length >= 5) break;
        const c = parseColorString(h);
        if (c) foundColors.push(c);
      }
      continue;
    }

    // Try finding rgba(...) patterns
    const rgbaMatches = line.match(/rgba?\([^)]+\)/gi);
    if (rgbaMatches) {
      for (const rgb of rgbaMatches) {
        if (foundColors.length >= 5) break;
        const c = parseColorString(rgb);
        if (c) foundColors.push(c);
      }
      continue;
    }
  }

  // If still fewer than 5 and original text hasn't yielded all, try comma split
  if (foundColors.length === 0) {
    const tokens = text.split(/,\s*(?=[#a-zA-Z[])/).map(t => t.trim()).filter(Boolean);
    for (const t of tokens) {
      if (foundColors.length >= 5) break;
      const c = parseColorString(t);
      if (c) foundColors.push(c);
    }
  }

  return foundColors.slice(0, 5);
}

// Generate color harmonies (5 slots) based on seed color
export function generateHarmonyPalette(seed: RGBAColor, harmonyType: 'complementary' | 'analogous' | 'triadic' | 'split-complementary' | 'monochromatic' | 'warm-sunset' | 'cool-cyber'): RGBAColor[] {
  const hsl = rgbaToHsl(seed);
  const result: HSLColor[] = [];

  switch (harmonyType) {
    case 'complementary': {
      result.push(
        hsl,
        { ...hsl, l: clamp(hsl.l + 20, 10, 95) },
        { ...hsl, h: (hsl.h + 180) % 360 },
        { ...hsl, h: (hsl.h + 180) % 360, l: clamp(hsl.l + 25, 10, 95) },
        { ...hsl, s: clamp(hsl.s - 30, 10, 100), l: clamp(hsl.l - 20, 10, 95) }
      );
      break;
    }
    case 'analogous': {
      result.push(
        { ...hsl, h: (hsl.h - 30 + 360) % 360 },
        { ...hsl, h: (hsl.h - 15 + 360) % 360 },
        hsl,
        { ...hsl, h: (hsl.h + 15) % 360 },
        { ...hsl, h: (hsl.h + 30) % 360 }
      );
      break;
    }
    case 'triadic': {
      result.push(
        hsl,
        { ...hsl, h: (hsl.h + 120) % 360 },
        { ...hsl, h: (hsl.h + 240) % 360 },
        { ...hsl, h: (hsl.h + 120) % 360, l: clamp(hsl.l + 20, 10, 90) },
        { ...hsl, h: (hsl.h + 240) % 360, l: clamp(hsl.l - 20, 10, 90) }
      );
      break;
    }
    case 'split-complementary': {
      result.push(
        hsl,
        { ...hsl, h: (hsl.h + 150) % 360 },
        { ...hsl, h: (hsl.h + 210) % 360 },
        { ...hsl, l: clamp(hsl.l + 25, 10, 95) },
        { ...hsl, h: (hsl.h + 180) % 360, s: 20 }
      );
      break;
    }
    case 'monochromatic': {
      result.push(
        { ...hsl, l: 20 },
        { ...hsl, l: 40 },
        { ...hsl, l: 60 },
        { ...hsl, l: 80 },
        { ...hsl, l: 92 }
      );
      break;
    }
    case 'warm-sunset': {
      result.push(
        { h: 340, s: 82, l: 52, a: 1 },
        { h: 14, s: 90, l: 58, a: 1 },
        { h: 38, s: 95, l: 60, a: 1 },
        { h: 48, s: 98, l: 64, a: 1 },
        { h: 265, s: 65, l: 40, a: 1 }
      );
      break;
    }
    case 'cool-cyber': {
      result.push(
        { h: 185, s: 95, l: 50, a: 1 },
        { h: 215, s: 90, l: 56, a: 1 },
        { h: 260, s: 85, l: 62, a: 1 },
        { h: 320, s: 88, l: 58, a: 1 },
        { h: 220, s: 40, l: 15, a: 1 }
      );
      break;
    }
  }

  return result.map(hslToRgba);
}

// 5 curated default starter palettes
export const STARTER_PALETTES: { name: string; colors: RGBAColor[] }[] = [
  {
    name: 'Neo Digital',
    colors: [
      { r: 99, g: 102, b: 241, a: 1 }, // Indigo
      { r: 236, g: 72, b: 153, a: 1 }, // Pink
      { r: 16, g: 185, b: 129, a: 1 }, // Emerald
      { r: 245, g: 158, b: 11, a: 1 }, // Amber
      { r: 14, g: 165, b: 233, a: 1 }, // Sky
    ],
  },
  {
    name: 'Cyberpunk Neon',
    colors: [
      { r: 255, g: 0, b: 128, a: 1 },
      { r: 0, g: 245, b: 255, a: 1 },
      { r: 123, g: 31, b: 162, a: 1 },
      { r: 255, g: 215, b: 0, a: 0.9 },
      { r: 15, g: 23, b: 42, a: 1 },
    ],
  },
  {
    name: 'Nordic Minimal',
    colors: [
      { r: 46, g: 64, b: 87, a: 1 },
      { r: 75, g: 101, b: 135, a: 1 },
      { r: 177, g: 201, b: 212, a: 1 },
      { r: 235, g: 240, b: 245, a: 1 },
      { r: 224, g: 122, b: 95, a: 1 },
    ],
  },
  {
    name: 'WebGL Shader Norm',
    colors: [
      { r: 255, g: 99, b: 71, a: 0.8 }, // 1.0, 0.388, 0.278
      { r: 52, g: 152, b: 219, a: 0.9 },
      { r: 46, g: 204, b: 113, a: 0.75 },
      { r: 155, g: 89, b: 182, a: 1.0 },
      { r: 241, g: 196, b: 15, a: 0.85 },
    ],
  },
];
