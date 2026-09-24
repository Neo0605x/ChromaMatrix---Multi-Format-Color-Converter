import React from 'react';
import { Palette, Copy, Wand2, RefreshCw, LayoutGrid, Eye, Sparkles } from 'lucide-react';
import { STARTER_PALETTES } from '../utils/colorUtils';
import { RGBAColor } from '../types/color';

interface HeaderProps {
  activeTab: 'converter' | 'grid5' | 'mockup' | 'export';
  setActiveTab: (tab: 'converter' | 'grid5' | 'mockup' | 'export') => void;
  onOpenBatchModal: (mode: 'paste' | 'export') => void;
  onRandomizeAll: () => void;
  onApplyStarter: (colors: RGBAColor[]) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenBatchModal,
  onRandomizeAll,
  onApplyStarter,
}) => {
  return (
    <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Palette className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              ChromaMatrix
              <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700/60 uppercase">
                5-Slot Lab
              </span>
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800/80">
          <button
            onClick={() => setActiveTab('converter')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'converter'
                ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            單槽精確編輯
          </button>
          <button
            onClick={() => setActiveTab('grid5')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'grid5'
                ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-pink-400" />
            五色並列對比
          </button>
          <button
            onClick={() => setActiveTab('mockup')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'mockup'
                ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            即時 UI 實境預覽
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2">
          {/* Starter Palettes dropdown */}
          <div className="relative group">
            <button className="px-2.5 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-800/90 hover:bg-neutral-700/90 border border-neutral-700/70 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap">
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">預設色盤</span>
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl p-1.5 hidden group-hover:block hover:block z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[11px] font-medium text-neutral-400 px-2 py-1 border-b border-neutral-800 mb-1">
                選擇五色範本
              </div>
              {STARTER_PALETTES.map((p) => (
                <button
                  key={p.name}
                  onClick={() => onApplyStarter(p.colors)}
                  className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-neutral-800 text-neutral-200 flex items-center justify-between transition-colors"
                >
                  <span>{p.name}</span>
                  <div className="flex -space-x-1">
                    {p.colors.map((c, i) => (
                      <span
                        key={i}
                        className="w-3 h-3 rounded-full border border-neutral-900 inline-block"
                        style={{ backgroundColor: `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})` }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onOpenBatchModal('paste')}
            title="批次貼上 5 個顏色"
            className="px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800/90 hover:bg-neutral-700/90 border border-neutral-700/80 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Copy className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">批次貼上</span>
          </button>

          <button
            onClick={() => onOpenBatchModal('export')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm shadow-indigo-500/20 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>批次導出</span>
          </button>

          <button
            onClick={onRandomizeAll}
            title="隨機生成未鎖定的顏色"
            className="p-1.5 text-neutral-400 hover:text-neutral-100 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
