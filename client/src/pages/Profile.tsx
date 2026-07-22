import { useState } from "react";
import MeTab from "../components/profile/MeTab";
import InfoTab from "../components/profile/InfoTab";
import ProjectsTab from "../components/profile/ProjectsTab";
import CVsTab from "../components/profile/CVsTab";

const TABS = ["Me", "Info", "Projects", "CVs"] as const;
type Tab = (typeof TABS)[number];

export default function Profile() {
  const [activeTab, setActiveTab] = useState<Tab>("Me");

  const renderTab = () => {
    switch (activeTab) {
      case "Me":
        return <MeTab />;
      case "Info":
        return <InfoTab />;
      case "Projects":
        return <ProjectsTab />;
      case "CVs":
        return <CVsTab />;
    }
  };

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200">
      <input id="profile-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col">
        <div className="navbar bg-base-100 border-b border-base-300 lg:hidden">
          <label
            htmlFor="profile-drawer"
            className="btn btn-square btn-ghost drawer-button"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
          <span className="ml-2 font-semibold">{activeTab}</span>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{renderTab()}</main>
      </div>

      <div className="drawer-side z-20">
        <label
          htmlFor="profile-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        />
        <aside className="w-56 min-h-full border-r border-base-300 bg-base-100 p-4">
          <ul className="menu">
            {TABS.map((tab) => (
              <li key={tab}>
                <a
                  className={activeTab === tab ? "active" : ""}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
