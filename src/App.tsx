import { useState } from "react";
import Explore from "./pages/Explore";
import FacebookGroups from "./pages/FacebookGroups";
import Admin from "./pages/Admin";

type View = "explore" | "facebook" | "admin";

export default function App() {
  const [view, setView] = useState<View>("explore");
  const [tapCount, setTapCount] = useState(0);

  const handleLogoTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 5) {
      setView("admin");
      setTapCount(0);
    }
  };

  const navItems: { id: View; label: string; icon: string }[] = [
    { id: "explore", label: "Campaigns", icon: "✦" },
    { id: "facebook", label: "Outreach", icon: "f" },
  ];

  return (
    <div className="min-h-screen bg-ifdark flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-ifdark/95 backdrop-blur border-b border-ifborder">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogoTap}
              className="w-9 h-9 rounded-xl bg-ifaccent flex items-center justify-center text-white font-bold text-sm"
            >
              IF
            </button>
            <div>
              <h1 className="text-sm font-bold text-iftext">Interplanetary Fund</h1>
              <p className="text-[10px] text-ifmuted">
                {view === "admin" ? "Admin Dashboard" :
                 view === "facebook" ? "Facebook Outreach" :
                 "Support a cause today"}
              </p>
            </div>
          </div>
          {view === "admin" ? (
            <button
              onClick={() => setView("explore")}
              className="text-[10px] text-ifmuted px-3 py-1 rounded-full border border-ifborder"
            >
              Exit Admin
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-ifgreen animate-pulse" />
              <span className="text-[10px] text-ifmuted">Live</span>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-4 pb-20 min-h-screen flex-1">
        {view === "explore" && <Explore />}
        {view === "facebook" && <FacebookGroups />}
        {view === "admin" && <Admin />}
      </main>

      {/* Bottom Navigation */}
      {view !== "admin" && (
        <nav className="sticky bottom-0 z-40 bg-ifdark/95 backdrop-blur border-t border-ifborder">
          <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-lg transition-colors ${
                  view === item.id
                    ? "text-ifaccent"
                    : "text-ifmuted"
                }`}
              >
                <span className={`text-lg ${item.id === "facebook" ? "font-bold" : ""}`}>
                  {item.icon}
                </span>
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
