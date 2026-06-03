import React from 'react';

export default function TopBar({
  title,
  subtitle,
  search,
  userIcon,
  actionButton,
  tabs,
  activeTab,
  setActiveTab
}) {
  return (
    <div className="w-full">

      {/* TOP BAR */}
      <div className="flex items-center justify-between mb-8 gap-6">

        {/* LEFT */}
        <div className="min-w-fit">
          <h1 className="text-4xl font-bold text-slate-900">
            {title}
          </h1>

          <p className="text-slate-500 mt-2">
            {subtitle}
          </p>
        </div>

        {/* CENTER SEARCH */}
        <div className="flex-1 flex justify-center">
          {search}
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4 min-w-fit">
          {actionButton}
          {userIcon}
        </div>

      </div>

      {/* TABS */}
<div
  className="
    inline-flex
    items-center
    gap-3
    p-2
    rounded-3xl

    bg-white/70
    backdrop-blur-xl

    border border-white/40

    shadow-[0_10px_30px_rgba(15,23,42,0.06)]
  "
>
  {tabs.map((tab) => {

    const isActive = activeTab === tab.label;

    return (
      <button
        key={tab.label}
        onClick={() => setActiveTab(tab.label)}
        className={`
          relative
          px-6
          py-3
          rounded-2xl

          text-sm
          font-semibold

          transition-all
          duration-300

          border

          ${
            isActive
              ? `
                bg-gradient-to-br
                from-violet-500/15
                to-blue-500/10

                border-violet-200

                text-violet-800

                shadow-[0_10px_24px_rgba(124,58,237,0.10)]

                scale-[1.02]
              `
              : `
                bg-white/40
                border-transparent

                text-slate-500

                hover:bg-white/80
                hover:text-slate-800
                hover:-translate-y-[1px]
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

    </div>
  );
}