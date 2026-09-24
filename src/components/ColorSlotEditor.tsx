import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  ClipboardPaste,
  Pipette,
  Sun,
  Moon,
  Sparkles,
  Info,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { ColorSlot, RGBAColor } from '../types/color';
import {
  rgbaToHex,
  rgbaToHex8,
  rgbaToNormalized,
  normalizedToRgba,
  rgbaToDecimal24,
  rgbaToDecimal32Argb,
  decimal24ToRgba,
  rgbaToHsl,
  hslToRgba,
  getColorExports,
  getContrastInfo,
  parseColorString,
  clamp,
  roundTo,
} from '../utils/colorUtils';

interface ColorSlotEditorProps {
  slot: ColorSlot;
  onUpdate: (rgba: RGBAColor) => void;
  onSelectSlot?: (id: number) => void;
  allSlots?: ColorSlot[];
}

export const ColorSlotEditor: React.FC<ColorSlotEditorProps> = ({
  slot,
  onUpdate,
}) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [pasteInputText, setPasteInputText] = useState('');
  const [pasteFeedback, setPasteFeedback] = useState<string | null>(null);

  // Local text inputs to permit typing without cursor jumping
  const [hexInput, setHexInput] = useState(rgbaToHex8(slot.rgba));
  const [rgbaCssInput, setRgbaCssInput] = useState(
    `rgba(${slot.rgba.r}, ${slot.rgba.g}, ${slot.rgba.b}, ${slot.rgba.a})`
  );
  const [normInput, setNormInput] = useState('');
  const [decInput, setDecInput] = useState('');

  // Sync inputs when slot.rgba updates externally
  useEffect(() => {
    const exports = getColorExports(slot.rgba);
    setHexInput(slot.rgba.a < 1 ? exports.hex8 : exports.hex);
    setRgbaCssInput(exports.rgbaCss);
    setNormInput(exports.normalizedArray);
    setDecInput(exports.decimalInt24.toString());
  }, [slot.rgba]);

  const exports = getColorExports(slot.rgba);
  const norm = rgbaToNormalized(slot.rgba);
  const hsl = rgbaToHsl(slot.rgba);
  const contrast = getContrastInfo(slot.rgba);

  // Copy handler
  const handleCopy = (text: string, formatName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    setTimeout(() => setCopiedFormat(null), 1800);
  };

  // Smart Paste Handler
  const handleSmartPaste = (textToParse: string) => {
    const parsed = parseColorString(textToParse);
    if (parsed) {
      onUpdate(parsed);
      setPasteFeedback(`已成功解析: rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${parsed.a})`);
      setPasteInputText('');
      setTimeout(() => setPasteFeedback(null), 3000);
    } else {
      setPasteFeedback('無法識別此色彩格式，請嘗試 #HEX、rgba()、[0~1] 或整數');
      setTimeout(() => setPasteFeedback(null), 3000);
    }
  };

  // Direct Channel Updaters
  const updateChannel = (channel: keyof RGBAColor, val: number) => {
    onUpdate({
      ...slot.rgba,
      [channel]: channel === 'a' ? clamp(val, 0, 1) : clamp(Math.round(val), 0, 255),
    });
  };

  // Normalized Float Updater
  const updateNormalizedChannel = (channel: 'r' | 'g' | 'b' | 'a', val: number) => {
    const currentNorm = rgbaToNormalized(slot.rgba);
    const updatedNorm = {
      ...currentNorm,
      [channel]: clamp(roundTo(val, 4), 0, 1),
    };
    onUpdate(normalizedToRgba(updatedNorm));
  };

  // Eyedropper API
  const handleEyedropper = async () => {
    // @ts-ignore
    if (window.EyeDropper) {
      try {
        // @ts-ignore
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          const parsed = parseColorString(result.sRGBHex);
          if (parsed) onUpdate(parsed);
        }
      } catch (err) {
        // Canceled
      }
    }
  };

  // Quick light/dark adjustments
  const adjustLightness = (delta: number) => {
    const newL = clamp(hsl.l + delta, 0, 100);
    onUpdate(hslToRgba({ ...hsl, l: newL }));
  };

  // Invert Color
  const invertColor = () => {
    onUpdate({
      r: 255 - slot.rgba.r,
      g: 255 - slot.rgba.g,
      b: 255 - slot.rgba.b,
      a: slot.rgba.a,
    });
  };

  return (
    <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-xl overflow-hidden divide-y divide-neutral-800/80">
      {/* Top Banner: Primary Swatch & Live Contrast Analysis */}
      <div className="p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Swatch & Color Picker Controls (Left 5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block animate-pulse" />
              槽位 #{slot.id} 色彩預覽
            </span>
            <div className="flex items-center gap-1.5">
              {/* Native Color Picker Trigger */}
              <label
                className="px-2.5 py-1 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
                title="開啟系統調色盤"
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-neutral-600 shadow-sm"
                  style={{ backgroundColor: exports.hex }}
                />
                調色盤
                <input
                  type="color"
                  value={exports.hex}
                  onChange={(e) => {
                    const parsed = parseColorString(e.target.value);
                    if (parsed) onUpdate({ ...parsed, a: slot.rgba.a });
                  }}
                  className="sr-only"
                />
              </label>

              {/* Eyedropper API */}
              {/* @ts-ignore */}
              {window.EyeDropper && (
                <button
                  type="button"
                  onClick={handleEyedropper}
                  className="p-1.5 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors"
                  title="吸取螢幕任意顏色"
                >
                  <Pipette className="w-4 h-4 text-sky-400" />
                </button>
              )}
            </div>
          </div>

          {/* Interactive Large Swatch with split alpha preview */}
          <div className="h-32 w-full rounded-xl overflow-hidden border border-neutral-700/80 relative shadow-inner checkerboard-pattern group">
            {/* Color Overlay */}
            <div
              className="w-full h-full transition-colors duration-100 flex items-end justify-between p-3.5"
              style={{
                backgroundColor: `rgba(${slot.rgba.r}, ${slot.rgba.g}, ${slot.rgba.b}, ${slot.rgba.a})`,
              }}
            >
              <div
                className="px-2.5 py-1 rounded-md text-xs font-mono font-bold shadow-md backdrop-blur-sm"
                style={{
                  backgroundColor: contrast.preferredText === '#FFFFFF' ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.85)',
                  color: contrast.preferredText,
                }}
              >
                {exports.hex8}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjustLightness(10)}
                  title="加亮 +10%"
                  className="px-2 py-0.5 text-[11px] font-mono rounded bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-colors"
                >
                  +亮度
                </button>
                <button
                  onClick={() => adjustLightness(-10)}
                  title="變暗 -10%"
                  className="px-2 py-0.5 text-[11px] font-mono rounded bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-colors"
                >
                  -亮度
                </button>
                <button
                  onClick={invertColor}
                  title="反轉色彩 (Invert)"
                  className="px-2 py-0.5 text-[11px] font-mono rounded bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-colors"
                >
                  反轉
                </button>
              </div>
            </div>
          </div>

          {/* Alpha Transparency Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-medium">不透明度 (Alpha)</span>
              <span className="font-mono text-neutral-300 tabular-nums">
                {Math.round(slot.rgba.a * 100)}% ({slot.rgba.a.toFixed(2)})
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={slot.rgba.a}
              onChange={(e) => updateChannel('a', parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-2 bg-neutral-800 rounded-lg appearance-none"
            />
          </div>
        </div>

        {/* Readability & WCAG Contrast Metrics (Right 7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-3 bg-neutral-950/70 p-4 rounded-xl border border-neutral-800/80">
          <div>
            <div className="text-xs font-semibold text-neutral-300 mb-1 flex items-center justify-between">
              <span>對比度與文字可讀性 (WCAG Contrast Score)</span>
              <span className="text-[11px] text-neutral-400 font-normal">
                基準: 純白 / 純黑背景
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              即時測試文字在該色彩背景下的對比表現，確保符合無障礙設計規範 (AA ≥ 4.5:1, AAA ≥ 7.0:1)。
            </p>
          </div>

          {/* Contrast Score Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Against White Background */}
            <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-white border border-neutral-400 shadow-sm flex items-center justify-center">
                  <Sun className="w-3.5 h-3.5 text-neutral-900" />
                </div>
                <div>
                  <div className="text-[11px] text-neutral-400">對比純白</div>
                  <div className="text-sm font-mono font-bold text-white tabular-nums">
                    {contrast.onWhite}:1
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    contrast.onWhite >= 7
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : contrast.onWhite >= 4.5
                      ? 'bg-blue-950 text-blue-300 border border-blue-800'
                      : 'bg-red-950 text-red-300 border border-red-800'
                  }`}
                >
                  {contrast.onWhite >= 7 ? 'AAA 合格' : contrast.onWhite >= 4.5 ? 'AA 合格' : '不建議'}
                </span>
              </div>
            </div>

            {/* Against Black Background */}
            <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-neutral-950 border border-neutral-700 shadow-sm flex items-center justify-center">
                  <Moon className="w-3.5 h-3.5 text-neutral-200" />
                </div>
                <div>
                  <div className="text-[11px] text-neutral-400">對比純黑</div>
                  <div className="text-sm font-mono font-bold text-white tabular-nums">
                    {contrast.onBlack}:1
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    contrast.onBlack >= 7
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : contrast.onBlack >= 4.5
                      ? 'bg-blue-950 text-blue-300 border border-blue-800'
                      : 'bg-red-950 text-red-300 border border-red-800'
                  }`}
                >
                  {contrast.onBlack >= 7 ? 'AAA 合格' : contrast.onBlack >= 4.5 ? 'AA 合格' : '不建議'}
                </span>
              </div>
            </div>
          </div>

          {/* Live Mock Text Simulation on this color */}
          <div
            className="p-3 rounded-lg border border-neutral-700/60 transition-colors flex items-center justify-between gap-4"
            style={{
              backgroundColor: `rgba(${slot.rgba.r}, ${slot.rgba.g}, ${slot.rgba.b}, ${slot.rgba.a})`,
            }}
          >
            <span
              className="text-xs font-medium"
              style={{ color: contrast.preferredText }}
            >
              最佳文字配色預覽 (Sample Text)
            </span>
            <span
              className="text-xs font-mono font-bold px-2 py-0.5 rounded shadow-sm"
              style={{
                backgroundColor: contrast.preferredText === '#FFFFFF' ? '#000000' : '#FFFFFF',
                color: contrast.preferredText === '#FFFFFF' ? '#FFFFFF' : '#000000',
              }}
            >
              建議字色: {contrast.preferredText === '#FFFFFF' ? '白色 #FFF' : '黑色 #000'}
            </span>
          </div>
        </div>
      </div>

      {/* Smart Paste Input Bar */}
      <div className="p-4 bg-neutral-950/40 flex flex-col sm:flex-row items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 shrink-0">
          <ClipboardPaste className="w-4 h-4 text-indigo-400" />
          <span>智慧貼上任意字串:</span>
        </div>
        <div className="relative flex-1 w-full flex items-center">
          <input
            type="text"
            placeholder="貼上 #HEX, rgba(...), [0.2, 0.5, 0.9], 16737095, 或 vec4..."
            value={pasteInputText}
            onChange={(e) => setPasteInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSmartPaste(pasteInputText);
            }}
            className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg px-3 py-1.5 text-xs font-mono text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 pr-16"
          />
          <button
            onClick={() => handleSmartPaste(pasteInputText)}
            className="absolute right-1 px-2.5 py-1 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
          >
            解析套用
          </button>
        </div>
        {pasteFeedback && (
          <div className="text-xs font-mono text-indigo-400 animate-in fade-in duration-150">
            {pasteFeedback}
          </div>
        )}
      </div>

      {/* 4 Main Core Format Converters Grid */}
      <div className="p-5 lg:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FORMAT 1: RGBA (0-255) */}
        <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              1. RGBA (0 - 255)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleCopy(exports.rgbaCss, 'rgbaCss')}
                className="px-2 py-1 text-[11px] font-mono text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 flex items-center gap-1 transition-colors"
              >
                {copiedFormat === 'rgbaCss' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                複製 CSS
              </button>
            </div>
          </div>

          {/* Direct Text Input for RGBA */}
          <div>
            <label className="text-[11px] text-neutral-400 mb-1 block">CSS 語法輸入</label>
            <input
              type="text"
              value={rgbaCssInput}
              onChange={(e) => {
                setRgbaCssInput(e.target.value);
                const parsed = parseColorString(e.target.value);
                if (parsed) onUpdate(parsed);
              }}
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* 4 Separate Sliders & Numeric Inputs: R, G, B, A */}
          <div className="space-y-2.5 pt-1">
            {/* Red */}
            <div className="flex items-center gap-3">
              <span className="w-5 text-xs font-mono font-bold text-red-400">R</span>
              <input
                type="range"
                min="0"
                max="255"
                value={slot.rgba.r}
                onChange={(e) => updateChannel('r', parseInt(e.target.value))}
                className="flex-1 accent-red-500 h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={slot.rgba.r}
                onChange={(e) => updateChannel('r', parseInt(e.target.value) || 0)}
                className="w-14 bg-neutral-900 border border-neutral-700/80 rounded px-1.5 py-1 text-xs font-mono text-center text-white tabular-nums"
              />
            </div>

            {/* Green */}
            <div className="flex items-center gap-3">
              <span className="w-5 text-xs font-mono font-bold text-emerald-400">G</span>
              <input
                type="range"
                min="0"
                max="255"
                value={slot.rgba.g}
                onChange={(e) => updateChannel('g', parseInt(e.target.value))}
                className="flex-1 accent-emerald-500 h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={slot.rgba.g}
                onChange={(e) => updateChannel('g', parseInt(e.target.value) || 0)}
                className="w-14 bg-neutral-900 border border-neutral-700/80 rounded px-1.5 py-1 text-xs font-mono text-center text-white tabular-nums"
              />
            </div>

            {/* Blue */}
            <div className="flex items-center gap-3">
              <span className="w-5 text-xs font-mono font-bold text-blue-400">B</span>
              <input
                type="range"
                min="0"
                max="255"
                value={slot.rgba.b}
                onChange={(e) => updateChannel('b', parseInt(e.target.value))}
                className="flex-1 accent-blue-500 h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={slot.rgba.b}
                onChange={(e) => updateChannel('b', parseInt(e.target.value) || 0)}
                className="w-14 bg-neutral-900 border border-neutral-700/80 rounded px-1.5 py-1 text-xs font-mono text-center text-white tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* FORMAT 2: 16進位 Hex / Hex8 */}
        <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pink-400" />
              2. 16進位 (Hex / Hex8 / 0x)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleCopy(exports.hex, 'hex')}
                className="px-2 py-1 text-[11px] font-mono text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 flex items-center gap-1 transition-colors"
              >
                {copiedFormat === 'hex' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                #6碼
              </button>
              <button
                onClick={() => handleCopy(exports.hex8, 'hex8')}
                className="px-2 py-1 text-[11px] font-mono text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 flex items-center gap-1 transition-colors"
              >
                {copiedFormat === 'hex8' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                #8碼含Alpha
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-neutral-400 mb-1 block">Hex 代碼輸入 (支援 # 或 0x)</label>
            <div className="relative">
              <input
                type="text"
                value={hexInput}
                onChange={(e) => {
                  setHexInput(e.target.value);
                  const parsed = parseColorString(e.target.value);
                  if (parsed) onUpdate(parsed);
                }}
                className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-indigo-500 uppercase tracking-wider"
              />
            </div>
          </div>

          {/* Quick Variants Display */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
              <div className="text-[10px] text-neutral-400">標準 6 位 Hex</div>
              <div className="font-mono font-bold text-white">{exports.hex}</div>
            </div>
            <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
              <div className="text-[10px] text-neutral-400">8 位 Hex (含 Alpha)</div>
              <div className="font-mono font-bold text-white">{exports.hex8}</div>
            </div>
            <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
              <div className="text-[10px] text-neutral-400">0x 格式 (開發者)</div>
              <div className="font-mono font-bold text-white">0x{exports.hex.substring(1)}</div>
            </div>
            <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
              <div className="text-[10px] text-neutral-400">HSLA 色相/飽和度</div>
              <div className="font-mono font-bold text-white">{hsl.h}°, {hsl.s}%, {hsl.l}%</div>
            </div>
          </div>
        </div>

        {/* FORMAT 3: 正規化 0 ~ 1 浮點數 (Normalized 0.0 ~ 1.0) */}
        <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              3. 正規化 0 ~ 1 浮點數 (WebGL / Shaders / Swift)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleCopy(exports.normalizedArray, 'normArr')}
                className="px-2 py-1 text-[11px] font-mono text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 flex items-center gap-1 transition-colors"
              >
                {copiedFormat === 'normArr' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                陣列 [ ]
              </button>
              <button
                onClick={() => handleCopy(exports.normalizedVec4, 'vec4')}
                className="px-2 py-1 text-[11px] font-mono text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 flex items-center gap-1 transition-colors"
              >
                {copiedFormat === 'vec4' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                vec4
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-neutral-400 mb-1 block">陣列格式輸入 [r, g, b, a]</label>
            <input
              type="text"
              value={normInput}
              onChange={(e) => {
                setNormInput(e.target.value);
                const parsed = parseColorString(e.target.value);
                if (parsed) onUpdate(parsed);
              }}
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* 4 Float Inputs (0.000 ~ 1.000) */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div>
              <span className="text-[10px] text-red-400 font-mono">r (0~1)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={norm.r}
                onChange={(e) => updateNormalizedChannel('r', parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-900 border border-neutral-700/80 rounded px-1.5 py-1 text-xs font-mono text-white text-center tabular-nums"
              />
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 font-mono">g (0~1)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={norm.g}
                onChange={(e) => updateNormalizedChannel('g', parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-900 border border-neutral-700/80 rounded px-1.5 py-1 text-xs font-mono text-white text-center tabular-nums"
              />
            </div>
            <div>
              <span className="text-[10px] text-blue-400 font-mono">b (0~1)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={norm.b}
                onChange={(e) => updateNormalizedChannel('b', parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-900 border border-neutral-700/80 rounded px-1.5 py-1 text-xs font-mono text-white text-center tabular-nums"
              />
            </div>
            <div>
              <span className="text-[10px] text-indigo-400 font-mono">a (0~1)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={norm.a}
                onChange={(e) => updateNormalizedChannel('a', parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-900 border border-neutral-700/80 rounded px-1.5 py-1 text-xs font-mono text-white text-center tabular-nums"
              />
            </div>
          </div>

          {/* Quick Engine Snippets */}
          <div className="pt-1 flex flex-wrap gap-1.5 text-[11px]">
            <button
              onClick={() => handleCopy(exports.swiftUi, 'swift')}
              className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors"
            >
              {copiedFormat === 'swift' ? '已複製 Swift!' : 'SwiftUI Color'}
            </button>
            <button
              onClick={() => handleCopy(exports.unityColor, 'unity')}
              className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors"
            >
              {copiedFormat === 'unity' ? '已複製 Unity!' : 'Unity C# Color'}
            </button>
          </div>
        </div>

        {/* FORMAT 4: 10進位 Decimal (數值與整數 Integer) */}
        <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              4. 10進位 (Decimal Channels & Integers)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleCopy(exports.decimalRgb, 'decRgb')}
                className="px-2 py-1 text-[11px] font-mono text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 flex items-center gap-1 transition-colors"
              >
                {copiedFormat === 'decRgb' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                R, G, B
              </button>
              <button
                onClick={() => handleCopy(exports.decimalInt24.toString(), 'dec24')}
                className="px-2 py-1 text-[11px] font-mono text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 flex items-center gap-1 transition-colors"
              >
                {copiedFormat === 'dec24' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                24位整數
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-neutral-400 mb-1 block">24位整數值輸入 (0 ~ 16777215)</label>
            <input
              type="text"
              value={decInput}
              onChange={(e) => {
                setDecInput(e.target.value);
                const intVal = parseInt(e.target.value, 10);
                if (!isNaN(intVal)) {
                  onUpdate(decimal24ToRgba(intVal, slot.rgba.a));
                }
              }}
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Decimal Integers Details */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
              <div className="text-[10px] text-neutral-400">24位整數 (RGB)</div>
              <div className="font-mono font-bold text-white tabular-nums">{exports.decimalInt24}</div>
            </div>
            <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
              <div className="text-[10px] text-neutral-400">32位 ARGB (含 Alpha)</div>
              <div className="font-mono font-bold text-white tabular-nums">{exports.decimalInt32}</div>
            </div>
          </div>

          <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span>常用於資料庫色彩整數儲存、二進位影像運算及舊版繪圖 API。</span>
          </div>
        </div>
      </div>
    </div>
  );
};
