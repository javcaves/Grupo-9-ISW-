import React, { useState } from 'react';
import TopBar from './topBar';

export default function TabsContent({
  title,
  subtitle,
  search,
  userIcon,
  actionButton,
  tabs
}) {

  const [activeTab, setActiveTab] = useState(
    tabs[0]?.label
  );

  const activeContent = tabs.find(
    (tab) => tab.label === activeTab
  )?.content;

  return (
    <div className="w-full px-8 py-6">

      {/* HEADER */}
      <TopBar
        title={title}
        subtitle={subtitle}
        search={search}
        userIcon={userIcon}
        actionButton={actionButton}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* CONTENIDO */}
      <div className="mt-10">
        {activeContent}
      </div>

    </div>
  );
}