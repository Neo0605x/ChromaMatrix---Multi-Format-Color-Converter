import React, { useState } from 'react';
import { Pipette, Copy, Check, Lock, Unlock, Eye, Sparkles } from 'lucide-react';
import { ColorSlot, RGBAColor } from '../types/color';
import {
  rgbaToHex,
  rgbaToHex8,
  rgbaToNormalized,
  normalizedToRgba,
  rgbaToDecimal24,
  getColorExports,
  parseColorString,
  getContrastInfo,
  clamp,
} from '../utils/colorUtils';

interface FiveSlotGridViewProps {
  slots: ColorSlot[];
  onUpdateSlot: (id: number, rgba: RGBAColor) => void;
  onToggleLock: (id: number) => void;
  activeSlotId: number;
  setActiveSlotId: (id: number) => void;
}

export const FiveSlotGridView: React.FC<FiveSlotGridViewProps> = ({
  slots,
  onUpdateSlot,
  onToggleLock,
  activeSlotId,
  setActiveSlotId,
}) => {
  const [copiedSlotId, setCopiedSlotId] = useState<{ id: number; format: string } | null>(null);

  const handleCopy = (id: number, text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSlotId({ id, format });
    setTimeout(() => setCopiedSlotId(null), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" />
            五色並列即時輸入與對比 (5-Slot Multi-Input Studio)
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            5 個槽位均可獨立直接輸入 RGBA、16進位 Hex、0~1 正規化浮點數或 10進位數值，並即時預覽效果。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {slots.map((slot) => {
          const hex = rgbaToHex(slot.rgba);
          const hex8 = rgbaToHex8(slot.rgba);
          const norm = rgbaToNormalized(slot.rgba);
          const dec24 = rgbaToDecimal24(slot.rgba);
          const contrast = getContrastInfo(slot.rgba);
          const isActive = slot.id === activeSlotId;

          return (
            <div
              key={slot.id}
              onClick={() => setActiveSlotId(slot.id)}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-neutral-900/90 flex flex-col justify-between ${
                isActive
                  ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Slot Header & Visual Preview */}
              <div>
                <div className="relative h-28 w-full checkerboard-pattern overflow-hidden">
                  <div
                    className="absolute inset-0 transition-colors duration-100 flex flex-col justify-between p-2.5"
                    style={{
                      backgroundColor: `rgba(${slot.rgba.r}, ${slot.rgba.g}, ${slot.rgba.b}, ${slot.rgba.a})`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-mono font-bold shadow-md backdrop-blur-md"
                        style={{
                          backgroundColor:
                            contrast.preferredText === '#FFFFFF'
                              ? 'rgba(0,0,0,0.7)'
                              : 'rgba(255,255,255,0.85)',
                          color: contrast.preferredText,
                        }}
                      >
                        #{slot.id} {slot.label}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLock(slot.id);
                          }}
                          className="p-1 rounded bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-colors"
                          title={slot.isLocked ? '已鎖定' : '未鎖定'}
                        >
                          {slot.isLocked ? (
                            <Lock className="w-3 h-3 text-amber-400" />
                          ) : (
                            <Unlock className="w-3 h-3 text-neutral-300" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Color picker overlay button inside swatch */}
                    <div className="flex items-center justify-between">
                      <label
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-1 rounded bg-black/65 hover:bg-black/80 text-white text-[10px] font-medium backdrop-blur-sm cursor-pointer flex items-center gap-1 transition-colors"
                      >
                        調色盤
                        <input
                          type="color"
                          value={hex}
                          onChange={(e) => {
                            const parsed = parseColorString(e.target.value);
                            if (parsed) onUpdateSlot(slot.id, { ...parsed, a: slot.rgba.a });
                          }}
                          className="sr-only"
                        />
                      </label>

                      <span
                        className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-black/65 text-neutral-200 backdrop-blur-sm"
                      >
                        {Math.round(slot.rgba.a * 100)}% α
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Editable Inputs for each format */}
                <div className="p-3 space-y-2.5">
                  {/* 16進位 Hex */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-neutral-300">16進位 (Hex)</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(slot.id, hex8, 'hex');
                        }}
                        className="text-neutral-400 hover:text-white p-0.5 rounded"
                        title="複製 Hex"
                      >
                        {copiedSlotId?.id === slot.id && copiedSlotId.format === 'hex' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={slot.rgba.a < 1 ? hex8 : hex}
                      onChange={(e) => {
                        const parsed = parseColorString(e.target.value);
                        if (parsed) onUpdateSlot(slot.id, parsed);
                      }}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-xs font-mono text-neutral-100 uppercase tracking-wide focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* RGBA (0-255) */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-neutral-300">RGBA (0~255)</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(
                            slot.id,
                            `rgba(${slot.rgba.r}, ${slot.rgba.g}, ${slot.rgba.b}, ${slot.rgba.a})`,
                            'rgba'
                          );
                        }}
                        className="text-neutral-400 hover:text-white p-0.5 rounded"
                        title="複製 RGBA"
                      >
                        {copiedSlotId?.id === slot.id && copiedSlotId.format === 'rgba' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={slot.rgba.r}
                        onChange={(e) =>
                          onUpdateSlot(slot.id, {
                            ...slot.rgba,
                            r: clamp(parseInt(e.target.value) || 0, 0, 255),
                          })
                        }
                        className="bg-neutral-950 border border-neutral-800 rounded px-1 py-1 text-xs font-mono text-center text-red-300"
                        title="Red"
                      />
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={slot.rgba.g}
                        onChange={(e) =>
                          onUpdateSlot(slot.id, {
                            ...slot.rgba,
                            g: clamp(parseInt(e.target.value) || 0, 0, 255),
                          })
                        }
                        className="bg-neutral-950 border border-neutral-800 rounded px-1 py-1 text-xs font-mono text-center text-emerald-300"
                        title="Green"
                      />
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={slot.rgba.b}
                        onChange={(e) =>
                          onUpdateSlot(slot.id, {
                            ...slot.rgba,
                            b: clamp(parseInt(e.target.value) || 0, 0, 255),
                          })
                        }
                        className="bg-neutral-950 border border-neutral-800 rounded px-1 py-1 text-xs font-mono text-center text-blue-300"
                        title="Blue"
                      />
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="1"
                        value={slot.rgba.a}
                        onChange={(e) =>
                          onUpdateSlot(slot.id, {
                            ...slot.rgba,
                            a: clamp(parseFloat(e.target.value) || 0, 0, 1),
                          })
                        }
                        className="bg-neutral-950 border border-neutral-800 rounded px-1 py-1 text-xs font-mono text-center text-indigo-300"
                        title="Alpha"
                      />
                    </div>
                  </div>

                  {/* 正規化 0 ~ 1 浮點數 */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-neutral-300">正規化 0~1 (Float)</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(
                            slot.id,
                            `[${norm.r.toFixed(3)}, ${norm.g.toFixed(3)}, ${norm.b.toFixed(3)}, ${norm.a.toFixed(3)}]`,
                            'norm'
                          );
                        }}
                        className="text-neutral-400 hover:text-white p-0.5 rounded"
                        title="複製 0~1 陣列"
                      >
                        {copiedSlotId?.id === slot.id && copiedSlotId.format === 'norm' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      <input
                        type="number"
                        step="0.02"
                        min="0"
                        max="1"
                        value={norm.r}
                        onChange={(e) => {
                          const val = clamp(parseFloat(e.target.value) || 0, 0, 1);
                          onUpdateSlot(slot.id, normalizedToRgba({ ...norm, r: val }));
                        }}
                        className="bg-neutral-950 border border-neutral-800 rounded px-0.5 py-1 text-[11px] font-mono text-center text-white"
                        title="Normalized R"
                      />
                      <input
                        type="number"
                        step="0.02"
                        min="0"
                        max="1"
                        value={norm.g}
                        onChange={(e) => {
                          const val = clamp(parseFloat(e.target.value) || 0, 0, 1);
                          onUpdateSlot(slot.id, normalizedToRgba({ ...norm, g: val }));
                        }}
                        className="bg-neutral-950 border border-neutral-800 rounded px-0.5 py-1 text-[11px] font-mono text-center text-white"
                        title="Normalized G"
                      />
                      <input
                        type="number"
                        step="0.02"
                        min="0"
                        max="1"
                        value={norm.b}
                        onChange={(e) => {
                          const val = clamp(parseFloat(e.target.value) || 0, 0, 1);
                          onUpdateSlot(slot.id, normalizedToRgba({ ...norm, b: val }));
                        }}
                        className="bg-neutral-950 border border-neutral-800 rounded px-0.5 py-1 text-[11px] font-mono text-center text-white"
                        title="Normalized B"
                      />
                      <input
                        type="number"
                        step="0.02"
                        min="0"
                        max="1"
                        value={norm.a}
                        onChange={(e) => {
                          const val = clamp(parseFloat(e.target.value) || 0, 0, 1);
                          onUpdateSlot(slot.id, normalizedToRgba({ ...norm, a: val }));
                        }}
                        className="bg-neutral-950 border border-neutral-800 rounded px-0.5 py-1 text-[11px] font-mono text-center text-white"
                        title="Normalized A"
                      />
                    </div>
                  </div>

                  {/* 10進位 Decimal 整數 */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-neutral-300">10進位 (24-bit Int)</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(slot.id, dec24.toString(), 'dec');
                        }}
                        className="text-neutral-400 hover:text-white p-0.5 rounded"
                        title="複製整數"
                      >
                        {copiedSlotId?.id === slot.id && copiedSlotId.format === 'dec' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={dec24}
                      onChange={(e) => {
                        const parsed = parseColorString(e.target.value);
                        if (parsed) onUpdateSlot(slot.id, parsed);
                      }}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-xs font-mono text-neutral-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Slot Quick Footer */}
              <div className="p-2.5 bg-neutral-950/80 border-t border-neutral-800/80 flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">對比白: {contrast.onWhite}:1</span>
                <span
                  className={`px-1 rounded font-bold font-mono text-[10px] ${
                    contrast.onWhite >= 4.5
                      ? 'text-emerald-400 bg-emerald-950/80'
                      : 'text-amber-400 bg-amber-950/80'
                  }`}
                >
                  {contrast.onWhite >= 4.5 ? 'AA 合格' : '弱對比'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
