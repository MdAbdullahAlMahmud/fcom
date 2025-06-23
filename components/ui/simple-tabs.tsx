import React from "react";

interface TabItem {
  key: string;
  label: string;
}

interface SimpleTabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (key: string) => void;
}

export function SimpleTabs({ tabs, value, onChange }: SimpleTabsProps) {
  return (
    <div className="flex w-full border-b border-slate-200 mb-6 gap-2 bg-slate-50 rounded-t-xl px-2 py-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`relative px-5 py-2 font-semibold text-base transition-colors focus:outline-none rounded-t-lg
            ${value === tab.key
              ? "bg-white border-x border-t border-slate-200 text-blue-700 shadow-sm -mb-px after:absolute after:left-2 after:right-2 after:-bottom-1 after:h-1 after:rounded-b-lg after:bg-blue-500/60"
              : "text-slate-500 hover:text-blue-700 hover:bg-slate-100"}
          `}
          onClick={() => onChange(tab.key)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
