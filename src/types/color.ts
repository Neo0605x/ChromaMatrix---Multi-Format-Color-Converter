export interface RGBAColor {
  r: number; // 0 - 255
  g: number; // 0 - 255
  b: number; // 0 - 255
  a: number; // 0.0 - 1.0
}

export interface HSLColor {
  h: number; // 0 - 360
  s: number; // 0 - 100
  l: number; // 0 - 100
  a: number; // 0.0 - 1.0
}

export interface NormalizedColor {
  r: number; // 0.000 - 1.000
  g: number; // 0.000 - 1.000
  b: number; // 0.000 - 1.000
  a: number; // 0.000 - 1.000
}

export interface ColorSlot {
  id: number;
  label: string;
  rgba: RGBAColor;
  isLocked?: boolean;
}

export type ActiveInputFormat = 'rgba' | 'hex' | 'decimal' | 'normalized' | 'hsl';

export interface ColorExports {
  hex: string;
  hex8: string;
  rgbaCss: string;
  rgbaModern: string;
  normalizedArray: string;
  normalizedVec4: string;
  swiftUi: string;
  unityColor: string;
  decimalRgb: string;
  decimalInt24: number;
  decimalInt32: number;
  hslaCss: string;
}
