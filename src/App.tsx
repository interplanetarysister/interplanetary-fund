import { useState } from "react";
import Explore from "./pages/Explore";
import Admin from "./pages/Admin";

export default function App() {
  const [view, setView] = useState<"explore" | "admin">("explore");
  const [tapCount, setTapCount] = useState(0);

  // Tap the logo 5 times to reveal admin mode
  const handleLogoTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 5) {
      setView("admin");
      setTapCount(0);
    }
  };

  return (
    <div className="min-h-screen bg-ifdark">
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
                {view === "admin" ? "Admin Dashboard" : "Support a cause today"}
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
      <main className="max-w-md mx-auto px-4 py-4 pb-8 min-h-screen">
        {view === "explore" ? <Explore /> : <Admin />}
      </main>
    </div>
  );
}
