import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Explore from "./pages/Explore";
import FacebookGroups from "./pages/FacebookGroups";
import Admin from "./pages/Admin";

type View = "explore" | "facebook" | "admin";

export default function App() {
  const [view, setView] = useState<View>("explore");
  const [tapCount, setTapCount] = useState(0);
  const [showPinGate, setShowPinGate] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [authed, setAuthed] = useState(false);

  // Verify PIN against backend
  const pinCheck = useQuery(
    api.auth.verifyAdminPin,
    showPinGate && pinInput.length >= 4 ? { pin: pinInput } : "skip"
  );

  const handleLogoTap = () => {
    if (view === "admin") return;
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 5) {
      if (authed) {
        setView("admin");
      } else {
        setShowPinGate(true);
      }
      setTapCount(0);
    }
  };

  const handlePinSubmit = () => {
    if (pinCheck?.valid === true) {
      setAuthed(true);
      setView("admin");
      setShowPinGate(false);
      setPinInput("");
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput("");
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
              onClick={() => {
                setView("explore");
                setAuthed(false);
              }}
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

      {/* PIN Gate Modal */}
      {showPinGate && (
        <div className="fixed inset-0 z-50 bg-ifdark/95 backdrop-blur flex items-center justify-center">
          <div className="max-w-xs w-full px-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-ifaccent flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                🔒
              </div>
              <h2 className="text-lg font-bold text-iftext">Admin Access</h2>
              <p className="text-xs text-ifmuted mt-1">Enter your PIN to continue</p>
            </div>

            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              placeholder="••••"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value.replace(/\D/g, ""));
                setPinError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
              className="input text-center text-2xl tracking-[0.5em] font-bold"
              autoFocus
            />

            {pinError && (
              <p className="text-xs text-ifred text-center mt-2">Incorrect PIN. Try again.</p>
            )}

            <button
              onClick={handlePinSubmit}
              disabled={pinInput.length < 4}
              className="btn-primary mt-4"
            >
              Unlock
            </button>

            <button
              onClick={() => {
                setShowPinGate(false);
                setPinInput("");
                setPinError(false);
              }}
              className="w-full text-xs text-ifmuted text-center mt-3 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-4 pb-20 min-h-screen flex-1">
        {view === "explore" && <Explore />}
        {view === "facebook" && <FacebookGroups />}
        {view === "admin" && <Admin />}
      </main>

      {/* Bottom Navigation */}
      {view !== "admin" && !showPinGate && (
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
