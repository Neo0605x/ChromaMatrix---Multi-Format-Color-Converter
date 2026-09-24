import React from 'react';
import { Lock, Unlock, Pipette, Sparkles, SlidersHorizontal, Check, Copy } from 'lucide-react';
import { ColorSlot, RGBAColor } from '../types/color';
import { rgbaToHex, rgbaToNormalized, generateHarmonyPalette } from '../utils/colorUtils';

interface FiveSlotBarProps {
  slots: ColorSlot[];
  activeSlotId: number;
  setActiveSlotId: (id: number) => void;
  onUpdateSlot: (id: number, rgba: RGBAColor) => void;
  onToggleLock: (id: number) => void;
  onApplyHarmony: (colors: RGBAColor[]) => void;
}

export const FiveSlotBar: React.FC<FiveSlotBarProps> = ({
  slots,
  activeSlotId,
  setActiveSlotId,
  onUpdateSlot,
  onToggleLock,
  onApplyHarmony,
}) => {
  const [copiedId, setCopiedId] = React.useState<number | null>(null);

  const activeSlot = slots.find((s) => s.id === activeSlotId) || slots[0];

  // Eyedropper API
  const handleEyedropper = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // @ts-ignore
    if (window.EyeDropper) {
      try {
        // @ts-ignore
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          const hex = result.sRGBHex;
          const r = parseInt(hex.substring(1, 3), 16);
          const g = parseInt(hex.substring(3, 5), 16);
          const b = parseInt(hex.substring(5, 7), 16);
          onUpdateSlot(id, { r, g, b, a: 1 });
        }
      } catch (err) {
        // User canceled eyedropper
      }
    }
  };

  const handleCopyHex = (id: number, hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Generate CSS gradient string combining all 5 colors
  const gradientCss = `linear-gradient(90deg, ${slots
    .map((s) => `rgba(${s.rgba.r}, ${s.rgba.g}, ${s.rgba.b}, ${s.rgba.a})`)
    .join(', ')})`;

  return (
    <section className="bg-neutral-900 border-b border-neutral-800 p-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Top bar info & harmony shortcuts */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="font-semibold text-neutral-200">5 槽色彩陣列</span>
            <span>·</span>
            <span>點選切換編輯</span>
            <span>·</span>
            <span>支援透明度即時渲染</span>
          </div>

          {/* Harmony Generator based on active slot */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
            <span className="text-neutral-400 text-[11px] flex items-center gap-1 shrink-0 mr-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              依槽位 #{activeSlotId} 調和:
            </span>
            <button
              onClick={() => onApplyHarmony(generateHarmonyPalette(activeSlot.rgba, 'analogous'))}
              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700/80 transition-colors shrink-0 text-[11px]"
            >
              類似色 (Analogous)
            </button>
            <button
              onClick={() => onApplyHarmony(generateHarmonyPalette(activeSlot.rgba, 'complementary'))}
              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700/80 transition-colors shrink-0 text-[11px]"
            >
              互補色 (Complementary)
            </button>
            <button
              onClick={() => onApplyHarmony(generateHarmonyPalette(activeSlot.rgba, 'triadic'))}
              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700/80 transition-colors shrink-0 text-[11px]"
            >
              三角色 (Triadic)
            </button>
            <button
              onClick={() => onApplyHarmony(generateHarmonyPalette(activeSlot.rgba, 'monochromatic'))}
              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700/80 transition-colors shrink-0 text-[11px]"
            >
              單色系階層
            </button>
            <button
              onClick={() => onApplyHarmony(generateHarmonyPalette(activeSlot.rgba, 'cool-cyber'))}
              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700/80 transition-colors shrink-0 text-[11px]"
            >
              科技霓虹
            </button>
          </div>
        </div>

        {/* 5 Slots Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {slots.map((slot) => {
            const isActive = slot.id === activeSlotId;
            const hex = rgbaToHex(slot.rgba);
            const norm = rgbaToNormalized(slot.rgba);
            const isTransparent = slot.rgba.a < 1;

            return (
              <div
                key={slot.id}
                onClick={() => setActiveSlotId(slot.id)}
                className={`group relative rounded-xl border transition-all cursor-pointer overflow-hidden flex flex-col ${
                  isActive
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg bg-neutral-800/80'
                    : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/90'
                }`}
              >
                {/* Visual Swatch with Checkerboard transparency backing */}
                <div className="relative h-20 w-full overflow-hidden checkerboard-pattern">
                  <div
                    className="absolute inset-0 transition-colors duration-150"
                    style={{
                      backgroundColor: `rgba(${slot.rgba.r}, ${slot.rgba.g}, ${slot.rgba.b}, ${slot.rgba.a})`,
                    }}
                  />

                  {/* Slot Top Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[11px]">
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono font-bold shadow-sm backdrop-blur-md text-[10px] ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-black/60 text-neutral-200'
                      }`}
                    >
                      #{slot.id} {slot.label}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Eyedropper API */}
                      {/* @ts-ignore */}
                      {window.EyeDropper && (
                        <button
                          type="button"
                          onClick={(e) => handleEyedropper(slot.id, e)}
                          title="吸取螢幕色彩"
                          className="p-1 rounded bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                        >
                          <Pipette className="w-3 h-3" />
                        </button>
                      )}

                      {/* Lock Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLock(slot.id);
                        }}
                        title={slot.isLocked ? '已鎖定 (隨機不變)' : '未鎖定'}
                        className={`p-1 rounded backdrop-blur-md transition-colors ${
                          slot.isLocked
                            ? 'bg-amber-500/80 text-white'
                            : 'bg-black/60 hover:bg-black/80 text-neutral-300'
                        }`}
                      >
                        {slot.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Alpha percentage badge if transparent */}
                  {isTransparent && (
                    <div className="absolute bottom-2 left-2 text-[10px] font-mono px-1 rounded bg-black/70 text-amber-300 backdrop-blur-sm">
                      α {Math.round(slot.rgba.a * 100)}%
                    </div>
                  )}
                </div>

                {/* Slot Details Footer */}
                <div className="p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-white tracking-wider">
                      {hex}
                    </span>
                    <button
                      onClick={(e) => handleCopyHex(slot.id, hex, e)}
                      title="複製 HEX"
                      className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-700/60 transition-colors"
                    >
                      {copiedId === slot.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Normalized 0~1 float preview */}
                  <div className="font-mono text-[10px] text-neutral-400 truncate tabular-nums">
                    [{norm.r.toFixed(2)}, {norm.g.toFixed(2)}, {norm.b.toFixed(2)}]
                  </div>

                  {/* Decimal RGB preview */}
                  <div className="font-mono text-[10px] text-neutral-400 truncate tabular-nums">
                    rgb({slot.rgba.r}, {slot.rgba.g}, {slot.rgba.b})
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5-Color Continuous Linear Gradient Bar Preview */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3 text-neutral-400" />
              5 色即時連續漸層混合預覽 (Continuous Spectrum Blend)
            </span>
            <span className="font-mono text-[10px] text-neutral-400">90deg Linear Gradient</span>
          </div>
          <div className="h-6 w-full rounded-lg overflow-hidden border border-neutral-800 checkerboard-pattern shadow-inner">
            <div className="w-full h-full transition-all duration-200" style={{ background: gradientCss }} />
          </div>
        </div>
      </div>
    </section>
  );
};
