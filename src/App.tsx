import React, { useState, useEffect } from 'react';
import { ColorSlot, RGBAColor } from './types/color';
import { Header } from './components/Header';
import { FiveSlotBar } from './components/FiveSlotBar';
import { ColorSlotEditor } from './components/ColorSlotEditor';
import { FiveSlotGridView } from './components/FiveSlotGridView';
import { UIMockupPreview } from './components/UIMockupPreview';
import { BatchModal } from './components/BatchModal';
import { STARTER_PALETTES, clamp, roundTo } from './utils/colorUtils';

const INITIAL_SLOTS: ColorSlot[] = [
  { id: 1, label: '主色 Primary', rgba: { r: 99, g: 102, b: 241, a: 1.0 }, isLocked: false },
  { id: 2, label: '強調 Accent', rgba: { r: 236, g: 72, b: 153, a: 0.95 }, isLocked: false },
  { id: 3, label: '成功 Success', rgba: { r: 16, g: 185, b: 129, a: 0.9 }, isLocked: false },
  { id: 4, label: '警示 Warning', rgba: { r: 245, g: 158, b: 11, a: 1.0 }, isLocked: false },
  { id: 5, label: '資訊 Info', rgba: { r: 14, g: 165, b: 233, a: 0.85 }, isLocked: false },
];

export default function App() {
  const [slots, setSlots] = useState<ColorSlot[]>(() => {
    const saved = localStorage.getItem('chromamatrix_5_slots');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 5) return parsed;
      } catch (e) {}
    }
    return INITIAL_SLOTS;
  });

  const [activeSlotId, setActiveSlotId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'converter' | 'grid5' | 'mockup' | 'export'>('converter');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchModalMode, setBatchModalMode] = useState<'paste' | 'export'>('paste');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('chromamatrix_5_slots', JSON.stringify(slots));
  }, [slots]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Update a single slot
  const handleUpdateSlot = (id: number, rgba: RGBAColor) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, rgba: { ...rgba, a: clamp(roundTo(rgba.a, 3), 0, 1) } } : s))
    );
  };

  // Toggle lock on slot
  const handleToggleLock = (id: number) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isLocked: !s.isLocked } : s))
    );
  };

  // Randomize unlocked slots
  const handleRandomizeAll = () => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.isLocked) return s;
        return {
          ...s,
          rgba: {
            r: Math.floor(Math.random() * 256),
            g: Math.floor(Math.random() * 256),
            b: Math.floor(Math.random() * 256),
            a: roundTo(Math.random() > 0.3 ? 1 : 0.6 + Math.random() * 0.4, 2),
          },
        };
      })
    );
    showToast('已隨機生成未鎖定的色彩');
  };

  // Apply starter palette
  const handleApplyStarter = (colors: RGBAColor[]) => {
    setSlots((prev) =>
      prev.map((s, i) => {
        if (colors[i]) {
          return { ...s, rgba: colors[i] };
        }
        return s;
      })
    );
    showToast('已成功套用預設色盤');
  };

  // Apply 5 harmonious colors
  const handleApplyHarmony = (colors: RGBAColor[]) => {
    setSlots((prev) =>
      prev.map((s, i) => {
        if (colors[i] && !s.isLocked) {
          return { ...s, rgba: colors[i] };
        }
        return s;
      })
    );
    showToast('已套用色彩調和方案');
  };

  // Apply batch pasted colors
  const handleApplyBatchColors = (colors: RGBAColor[]) => {
    setSlots((prev) =>
      prev.map((s, i) => {
        if (colors[i]) {
          return { ...s, rgba: colors[i] };
        }
        return s;
      })
    );
    showToast(`已批次套用 ${colors.length} 個顏色`);
  };

  const activeSlot = slots.find((s) => s.id === activeSlotId) || slots[0];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-neutral-850 border border-neutral-700 text-white text-xs font-medium shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBatchModal={(mode) => {
          setBatchModalMode(mode);
          setIsBatchModalOpen(true);
        }}
        onRandomizeAll={handleRandomizeAll}
        onApplyStarter={handleApplyStarter}
      />

      {/* 5-Slot Live Ribbon with continuous spectrum */}
      <FiveSlotBar
        slots={slots}
        activeSlotId={activeSlotId}
        setActiveSlotId={setActiveSlotId}
        onUpdateSlot={handleUpdateSlot}
        onToggleLock={handleToggleLock}
        onApplyHarmony={handleApplyHarmony}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {activeTab === 'converter' && (
          <div className="space-y-6">
            <ColorSlotEditor
              slot={activeSlot}
              onUpdate={(rgba) => handleUpdateSlot(activeSlot.id, rgba)}
              onSelectSlot={setActiveSlotId}
              allSlots={slots}
            />
          </div>
        )}

        {activeTab === 'grid5' && (
          <FiveSlotGridView
            slots={slots}
            onUpdateSlot={handleUpdateSlot}
            onToggleLock={handleToggleLock}
            activeSlotId={activeSlotId}
            setActiveSlotId={setActiveSlotId}
          />
        )}

        {activeTab === 'mockup' && (
          <UIMockupPreview slots={slots} />
        )}

        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-1">批次代碼導出中心 (Code Export Hub)</h2>
              <p className="text-xs text-neutral-400 mb-6">
                直接獲取 5 個槽位的 CSS 變數、Tailwind 配置、GLSL Shader 正規化 vec4、SwiftUI 或 Unity 程式碼。
              </p>
              <button
                onClick={() => {
                  setBatchModalMode('export');
                  setIsBatchModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm"
              >
                開啟導出面板
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Batch Paste & Export Modal */}
      <BatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        mode={batchModalMode}
        setMode={setBatchModalMode}
        slots={slots}
        onApplyBatchColors={handleApplyBatchColors}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-850 bg-neutral-950 py-5 px-4 text-center text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ChromaMatrix · 多進位色彩轉換器與五色調色盤</span>
          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <span>RGBA (0-255)</span>
            <span>·</span>
            <span>16進位 Hex</span>
            <span>·</span>
            <span>0~1 正規化浮點數</span>
            <span>·</span>
            <span>10進位整數</span>
            <span>·</span>
            <span>Color Picker</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
