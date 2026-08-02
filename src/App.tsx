import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import Agents from "./pages/Agents";
import Treasury from "./pages/Treasury";
import Platforms from "./pages/Platforms";
import Reports from "./pages/Reports";

type Page = "dashboard" | "campaigns" | "agents" | "treasury" | "platforms" | "reports";

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: "dashboard", label: "Home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "campaigns", label: "Campaigns", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { id: "agents", label: "Agents", icon: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-2a4 4 0 100-8 4 4 0 000 8z" },
  { id: "treasury", label: "Treasury", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "platforms", label: "Platforms", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" },
  { id: "reports", label: "Reports", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard />;
      case "campaigns": return <Campaigns />;
      case "agents": return <Agents />;
      case "treasury": return <Treasury />;
      case "platforms": return <Platforms />;
      case "reports": return <Reports />;
    }
  };

  return (
    <div className="min-h-screen bg-ifdark">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-ifdark/95 backdrop-blur border-b border-ifborder">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-ifaccent flex items-center justify-center text-white font-bold text-sm">
              IF
            </div>
            <div>
              <h1 className="text-sm font-bold text-iftext">Interplanetary Fund</h1>
              <p className="text-[10px] text-ifmuted">Credit-Free Backend</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-ifgreen animate-pulse" />
            <span className="text-[10px] text-ifmuted">Convex Live</span>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-md mx-auto px-4 py-4 pb-24 min-h-screen">
        {renderPage()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-ifcard/95 backdrop-blur border-t border-ifborder">
        <div className="max-w-md mx-auto flex items-center justify-around px-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`nav-btn flex-1 ${page === item.id ? "nav-btn-active" : "nav-btn-inactive"}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
