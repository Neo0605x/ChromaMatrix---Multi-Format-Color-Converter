import React, { useState } from 'react';
import { X, Check, Copy, ClipboardPaste, ArrowRight, Download, FileCode } from 'lucide-react';
import { ColorSlot, RGBAColor } from '../types/color';
import {
  extractMultipleColors,
  rgbaToHex,
  rgbaToHex8,
  rgbaToNormalized,
  getColorExports,
} from '../utils/colorUtils';

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'paste' | 'export';
  setMode: (mode: 'paste' | 'export') => void;
  slots: ColorSlot[];
  onApplyBatchColors: (colors: RGBAColor[]) => void;
}

export const BatchModal: React.FC<BatchModalProps> = ({
  isOpen,
  onClose,
  mode,
  setMode,
  slots,
  onApplyBatchColors,
}) => {
  const [pasteText, setPasteText] = useState('');
  const [exportFormat, setExportFormat] = useState<
    'css' | 'tailwind' | 'glsl' | 'swift' | 'unity' | 'json' | 'hex-array' | 'rgba-array'
  >('css');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Real-time extracted colors from the pasted text
  const extractedColors = extractMultipleColors(pasteText);

  // Generate batch export code according to selected exportFormat
  const getBatchExportCode = () => {
    switch (exportFormat) {
      case 'css':
        return `:root {\n${slots
          .map((s) => `  --color-${s.id}: ${rgbaToHex8(s.rgba)}; /* ${s.label} */`)
          .join('\n')}\n}`;

      case 'tailwind':
        return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        brand: {\n${slots
          .map((s) => `          '${s.id}': '${rgbaToHex8(s.rgba)}',`)
          .join('\n')}\n        }\n      }\n    }\n  }\n}`;

      case 'glsl':
        return `// GLSL / Shader Normalized 0~1 vec4 array\nvec4 palette[5] = vec4[5](\n${slots
          .map((s) => {
            const n = rgbaToNormalized(s.rgba);
            return `    vec4(${n.r.toFixed(3)}, ${n.g.toFixed(3)}, ${n.b.toFixed(3)}, ${n.a.toFixed(3)})`;
          })
          .join(',\n')}\n);`;

      case 'swift':
        return `// SwiftUI Color Palette\nimport SwiftUI\n\nstruct ColorPalette {\n${slots
          .map((s) => {
            const n = rgbaToNormalized(s.rgba);
            return `    static let color${s.id} = Color(red: ${n.r.toFixed(3)}, green: ${n.g.toFixed(3)}, blue: ${n.b.toFixed(3)}, opacity: ${n.a.toFixed(3)})`;
          })
          .join('\n')}\n}`;

      case 'unity':
        return `// Unity C# Color Array\nusing UnityEngine;\n\npublic static class ColorPalette {\n    public static readonly Color[] Colors = new Color[5] {\n${slots
          .map((s) => {
            const n = rgbaToNormalized(s.rgba);
            return `        new Color(${n.r.toFixed(3)}f, ${n.g.toFixed(3)}f, ${n.b.toFixed(3)}f, ${n.a.toFixed(3)}f)`;
          })
          .join(',\n')}\n    };\n}`;

      case 'json':
        return JSON.stringify(
          slots.map((s) => ({
            id: s.id,
            label: s.label,
            hex: rgbaToHex(s.rgba),
            hex8: rgbaToHex8(s.rgba),
            rgba: s.rgba,
            normalized: rgbaToNormalized(s.rgba),
          })),
          null,
          2
        );

      case 'hex-array':
        return JSON.stringify(slots.map((s) => rgbaToHex8(s.rgba)), null, 2);

      case 'rgba-array':
        return `[\n${slots
          .map((s) => `  "rgba(${s.rgba.r}, ${s.rgba.g}, ${s.rgba.b}, ${s.rgba.a})"`)
          .join(',\n')}\n]`;

      default:
        return '';
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getBatchExportCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyPaste = () => {
    if (extractedColors.length > 0) {
      onApplyBatchColors(extractedColors);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            <button
              onClick={() => setMode('paste')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                mode === 'paste' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              批次貼上 5 個色彩
            </button>
            <button
              onClick={() => setMode('export')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                mode === 'export' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              批次導出代碼
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {mode === 'paste' ? (
            /* BATCH PASTE MODE */
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                  貼上包含最多 5 個色彩的任意文字 (支援多行 Hex、RGBA、JSON、0~1 等)
                </label>
                <textarea
                  rows={5}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`例如直接貼上：
#6366F1
rgba(236, 72, 153, 0.9)
#10B981
[0.96, 0.62, 0.04, 1.0]
rgb(14, 165, 233)
或是以逗號分隔的 Hex 列表`}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Live Extraction Preview */}
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                  <span>
                    已智慧偵測到色彩: <strong className="text-indigo-400 font-mono">{extractedColors.length}</strong> / 5
                  </span>
                  {extractedColors.length > 0 && (
                    <span className="text-[11px] text-emerald-400">可直接點擊套用</span>
                  )}
                </div>

                {extractedColors.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-neutral-800 text-center text-xs text-neutral-500">
                    請在上方輸入框中貼上色彩文字，系統將自動解析出色彩卡片
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-2">
                    {extractedColors.map((c, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-neutral-800 bg-neutral-950 overflow-hidden"
                      >
                        <div className="h-12 w-full checkerboard-pattern relative">
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundColor: `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`,
                            }}
                          />
                        </div>
                        <div className="p-1.5 text-center">
                          <div className="font-mono text-[10px] text-white font-semibold">
                            {rgbaToHex(c)}
                          </div>
                          <div className="font-mono text-[9px] text-neutral-400">
                            α {Math.round(c.a * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* BATCH EXPORT MODE */
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                  選擇導出格式 (相容各大框架與遊戲引擎)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'css', label: 'CSS Variables' },
                    { id: 'tailwind', label: 'Tailwind Config' },
                    { id: 'glsl', label: 'GLSL vec4[5]' },
                    { id: 'swift', label: 'SwiftUI' },
                    { id: 'unity', label: 'Unity C#' },
                    { id: 'json', label: 'Full JSON' },
                    { id: 'hex-array', label: 'Hex [ ]' },
                    { id: 'rgba-array', label: 'RGBA [ ]' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => setExportFormat(fmt.id as any)}
                      className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors ${
                        exportFormat === fmt.id
                          ? 'bg-neutral-800 text-indigo-400 border-indigo-500 font-semibold'
                          : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Display Area */}
              <div className="relative">
                <pre className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-xs font-mono text-emerald-300 overflow-x-auto max-h-56 leading-relaxed selection:bg-neutral-800">
                  {getBatchExportCode()}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <div className="text-xs text-neutral-400">
            {mode === 'paste'
              ? '將依照順序替換前 N 個槽位'
              : '複製至剪貼簿即可直接在專案中使用'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              取消
            </button>

            {mode === 'paste' ? (
              <button
                disabled={extractedColors.length === 0}
                onClick={handleApplyPaste}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                套用 {extractedColors.length} 個顏色至色槽
              </button>
            ) : (
              <button
                onClick={handleCopyCode}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? '已複製代碼！' : '一鍵複製代碼'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
