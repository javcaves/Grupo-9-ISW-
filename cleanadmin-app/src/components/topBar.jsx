import React from 'react';
import UserMenu from './userMenu';

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
          <h1
            className="text-4xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h1>

          <p
            className="mt-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-4 min-w-fit">
          {actionButton}
          <UserMenu
            user={user}
            onLogout={onLogout}
          />
        </div>
      </div>

      {tabs && tabs.length > 0 && (
        <div className="flex items-center gap-[14px] flex-wrap">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.label;

            return (
<button
  key={tab.label}
  onClick={() => setActiveTab(tab.label)}
  className={`
    relative min-w-[170px] h-[56px] flex items-center justify-center
    px-[20px] rounded-[18px] font-medium text-sm cursor-pointer
    transition-all duration-300 border overflow-hidden
    ${isActive
      ? `bg-gradient-to-br from-[rgba(var(--tab-active-from),0.15)] to-[rgba(var(--tab-active-to),0.10)]
         border-[rgba(var(--tab-active-border),0.3)]
         text-[var(--tab-active-text)]
         shadow-[0_10px_24px_var(--tab-active-shadow)]
         scale-[1.03]`
      : `text-[var(--tab-inactive-text)]
         shadow-[0_6px_18px_var(--tab-inactive-shadow)]
         hover:scale-[1.05]
         hover:text-[var(--tab-hover-text)]
         hover:shadow-[0_10px_24px_var(--tab-hover-shadow)]`
    }
  `}
  style={{
    background: !isActive ? 'var(--bg-card)' : undefined,
    borderColor: !isActive ? 'var(--border-color)' : undefined
  }}
>
  <span className="relative z-10">{tab.label}</span>
</button>
            );
          })}
        </div>
      )}
    </div>
  );
}