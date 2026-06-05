import React from 'react';
import UserMenu from './UserMenu';

export default function TopBar({
  title,
  subtitle,
  user,
  search,
  actionButton,
  tabs,
  activeTab,
  setActiveTab,
  onLogout
}) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8 gap-6">
        <div className="min-w-fit">
          <h1 className="text-4xl font-bold text-slate-900">
            {title}
          </h1>

          <p className="text-slate-500 mt-2">
            {subtitle}
          </p>
        </div>

        <div className="flex-1 flex justify-center">
          {search}
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4 min-w-fit">
          {actionButton}
          <UserMenu user={user} onLogout={onLogout} />
        </div>
      </div>

      {/* TABS */}
      {tabs && tabs.length > 0 && (
        <div className="flex items-center gap-[14px] flex-wrap">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.label;

            return (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`
                  relative
                  min-w-[170px]
                  h-[56px]
                  flex items-center justify-center
                  px-[20px]
                  rounded-[18px]
                  font-medium
                  text-sm
                  cursor-pointer
                  transition-all duration-300
                  border
                  overflow-hidden
                  ${
                    isActive
                      ? `
                        bg-gradient-to-br from-violet-600/15 to-blue-500/10
                        border-violet-300/30
                        text-violet-700
                        shadow-[0_10px_24px_rgba(124,58,237,0.10)]
                        scale-[1.03]
                      `
                      : `
                        bg-white
                        border-slate-200/70
                        text-slate-700
                        shadow-[0_6px_18px_rgba(15,23,42,0.04)]
                        hover:scale-[1.05]
                        hover:text-black
                        hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]
                      `
                  }
                `}
              >
                <span className="relative z-10">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}