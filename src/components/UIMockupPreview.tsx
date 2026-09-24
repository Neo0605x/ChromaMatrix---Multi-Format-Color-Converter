import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Layers,
  Sparkles,
  TrendingUp,
  Activity,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { ColorSlot } from '../types/color';
import { rgbaToHex, rgbaToHex8, getContrastInfo } from '../utils/colorUtils';

interface UIMockupPreviewProps {
  slots: ColorSlot[];
}

export const UIMockupPreview: React.FC<UIMockupPreviewProps> = ({ slots }) => {
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [colorBlindFilter, setColorBlindFilter] = useState<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'grayscale'>('none');

  const c1 = slots[0]?.rgba || { r: 99, g: 102, b: 241, a: 1 };
  const c2 = slots[1]?.rgba || { r: 236, g: 72, b: 153, a: 1 };
  const c3 = slots[2]?.rgba || { r: 16, g: 185, b: 129, a: 1 };
  const c4 = slots[3]?.rgba || { r: 245, g: 158, b: 11, a: 1 };
  const c5 = slots[4]?.rgba || { r: 14, g: 165, b: 233, a: 1 };

  const c1Css = `rgba(${c1.r}, ${c1.g}, ${c1.b}, ${c1.a})`;
  const c2Css = `rgba(${c2.r}, ${c2.g}, ${c2.b}, ${c2.a})`;
  const c3Css = `rgba(${c3.r}, ${c3.g}, ${c3.b}, ${c3.a})`;
  const c4Css = `rgba(${c4.r}, ${c4.g}, ${c4.b}, ${c4.a})`;
  const c5Css = `rgba(${c5.r}, ${c5.g}, ${c5.b}, ${c5.a})`;

  // Filter style matrix for color blindness simulation
  const getFilterStyle = () => {
    switch (colorBlindFilter) {
      case 'grayscale':
        return 'grayscale(100%)';
      case 'protanopia':
        return 'url(#protanopia-filter)';
      case 'deuteranopia':
        return 'url(#deuteranopia-filter)';
      case 'tritanopia':
        return 'url(#tritanopia-filter)';
      default:
        return 'none';
    }
  };

  return (
    <div className="space-y-4">
      {/* SVG Filters for Color Blindness Simulation */}
      <svg className="sr-only" aria-hidden="true">
        <filter id="protanopia-filter">
          <feColorMatrix
            type="matrix"
            values="0.567, 0.433, 0, 0, 0
                    0.558, 0.442, 0, 0, 0
                    0, 0.242, 0.758, 0, 0
                    0, 0, 0, 1, 0"
          />
        </filter>
        <filter id="deuteranopia-filter">
          <feColorMatrix
            type="matrix"
            values="0.625, 0.375, 0, 0, 0
                    0.7, 0.3, 0, 0, 0
                    0, 0.3, 0.7, 0, 0
                    0, 0, 0, 1, 0"
          />
        </filter>
        <filter id="tritanopia-filter">
          <feColorMatrix
            type="matrix"
            values="0.95, 0.05, 0, 0, 0
                    0, 0.433, 0.567, 0, 0
                    0, 0.475, 0.525, 0, 0
                    0, 0, 0, 1, 0"
          />
        </filter>
      </svg>

      {/* Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-3">
        <div className="flex items-center gap-2 text-xs">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-white">五色即時 UI 實境模擬 (Real-time Mockup)</span>
          <span className="text-neutral-500">·</span>
          <span className="text-neutral-400">驗證 5 個色彩在真實元件間的和諧度與辨識度</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Color blindness simulator */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Eye className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={colorBlindFilter}
              onChange={(e) => setColorBlindFilter(e.target.value as any)}
              className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded px-2 py-1 focus:outline-none"
            >
              <option value="none">正常視覺 (Normal)</option>
              <option value="protanopia">紅色盲 (Protanopia)</option>
              <option value="deuteranopia">綠色盲 (Deuteranopia)</option>
              <option value="tritanopia">藍色盲 (Tritanopia)</option>
              <option value="grayscale">全色盲 / 單色 (Grayscale)</option>
            </select>
          </div>

          {/* Theme switcher */}
          <div className="flex items-center bg-neutral-950 p-0.5 rounded-lg border border-neutral-800">
            <button
              onClick={() => setPreviewTheme('dark')}
              className={`p-1.5 rounded-md transition-colors ${
                previewTheme === 'dark' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'
              }`}
              title="暗黑主題"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPreviewTheme('light')}
              className={`p-1.5 rounded-md transition-colors ${
                previewTheme === 'light' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-white'
              }`}
              title="明亮主題"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mockup Canvas */}
      <div
        style={{ filter: getFilterStyle() }}
        className={`rounded-2xl border p-6 transition-all duration-200 ${
          previewTheme === 'dark'
            ? 'bg-neutral-950 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
        }`}
      >
        {/* Mock Topbar */}
        <div
          className={`flex items-center justify-between pb-4 border-b ${
            previewTheme === 'dark' ? 'border-neutral-800/80' : 'border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Primary Accent Color 1 Dot */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
              style={{ backgroundColor: c1Css }}
            >
              #1
            </div>
            <span className="font-bold text-sm tracking-tight">Studio Enterprise Suite</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Accent Color 2 Button */}
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-transform active:scale-95"
              style={{ backgroundColor: c2Css }}
            >
              操作按鈕 (Slot #2)
            </button>
            {/* Accent Color 5 Ghost Button */}
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-medium border"
              style={{
                borderColor: c5Css,
                color: c5Css,
              }}
            >
              次要按鈕 (Slot #5)
            </button>
          </div>
        </div>

        {/* Mock Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          {/* Card 1: Metric KPI with Color 1 & 3 */}
          <div
            className={`p-4 rounded-xl border ${
              previewTheme === 'dark' ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs ${previewTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}`}>
                即時營運指標 (Slot #1)
              </span>
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: c1Css }}
              />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums mb-1">
              $148,920
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <TrendingUp className="w-3.5 h-3.5" style={{ color: c3Css }} />
              <span className="font-medium" style={{ color: c3Css }}>
                +24.6% 達成率 (Slot #3)
              </span>
            </div>
          </div>

          {/* Card 2: Status & Health with Color 4 & 5 */}
          <div
            className={`p-4 rounded-xl border ${
              previewTheme === 'dark' ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs ${previewTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}`}>
                系統警示狀態 (Slot #4)
              </span>
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: c4Css }}
              />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums mb-1">
              99.98%
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Activity className="w-3.5 h-3.5" style={{ color: c5Css }} />
              <span className="font-medium" style={{ color: c5Css }}>
                連線伺服器正常 (Slot #5)
              </span>
            </div>
          </div>

          {/* Card 3: Color Palette Breakdown Strip */}
          <div
            className={`p-4 rounded-xl border ${
              previewTheme === 'dark' ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}
          >
            <div className="text-xs font-semibold mb-2">5 色調色盤綜合表現</div>
            <div className="flex h-7 rounded-lg overflow-hidden border border-neutral-700/50 mb-3 shadow-inner">
              {slots.map((s) => (
                <div
                  key={s.id}
                  className="flex-1 h-full"
                  style={{ backgroundColor: `rgba(${s.rgba.r}, ${s.rgba.g}, ${s.rgba.b}, ${s.rgba.a})` }}
                  title={`Slot #${s.id}: ${rgbaToHex(s.rgba)}`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span>5 通道已就緒</span>
              <span>100% 即時渲染</span>
            </div>
          </div>
        </div>

        {/* Mock Chart & Multi-Bar Visualization */}
        <div
          className={`mt-4 p-5 rounded-xl border ${
            previewTheme === 'dark' ? 'bg-neutral-900/50 border-neutral-800' : 'bg-neutral-50/80 border-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold">五色圖表柱狀分佈模擬 (Chart Distribution)</span>
            <div className="flex items-center gap-3 text-xs">
              {slots.map((s) => (
                <div key={s.id} className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: `rgba(${s.rgba.r}, ${s.rgba.g}, ${s.rgba.b}, ${s.rgba.a})` }}
                  />
                  <span className="text-[11px] text-neutral-400">#{s.id}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Simulated 5-Bar Chart */}
          <div className="flex items-end gap-4 h-28 pt-4 border-b border-neutral-700/40">
            {[
              { slot: 0, val: 82, label: 'Q1' },
              { slot: 1, val: 95, label: 'Q2' },
              { slot: 2, val: 68, label: 'Q3' },
              { slot: 3, val: 88, label: 'Q4' },
              { slot: 4, val: 74, label: '目標' },
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  className="w-full max-w-[48px] rounded-t-lg transition-all duration-300 shadow-sm"
                  style={{
                    height: `${item.val}%`,
                    backgroundColor: `rgba(${slots[item.slot]?.rgba.r || 100}, ${slots[item.slot]?.rgba.g || 100}, ${slots[item.slot]?.rgba.b || 100}, ${slots[item.slot]?.rgba.a || 1})`,
                  }}
                />
                <span className="text-[10px] font-mono text-neutral-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
