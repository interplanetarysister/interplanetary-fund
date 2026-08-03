/*
 * Interplanetary Fund — Copyright © 2026 Michelle Rogers. All Rights Reserved.
 * PROPRIETARY AND CONFIDENTIAL. Do not copy, distribute, or modify without
 * express written permission. See LICENSE file for full terms.
 */

import { useState, useEffect } from "react";

const TERMS_KEY = "if_terms_accepted_v1";
const TERMS_DATE = "August 3, 2026";

export function TermsAcceptance({ children }: { children: React.ReactNode }) {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(TERMS_KEY);
    if (stored === "true") setAccepted(true);
  }, []);

  const accept = () => {
    localStorage.setItem(TERMS_KEY, "true");
    setAccepted(true);
  };

  if (accepted) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
      <div className="max-w-md bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <h2 className="text-white text-xl font-bold mb-3">Terms of Service</h2>
        <p className="text-zinc-400 text-sm mb-4">
          By using Interplanetary Fund, you agree to our Terms of Service and
          Privacy Policy (last updated {TERMS_DATE}).
        </p>
        <div className="text-zinc-500 text-xs mb-4 space-y-1">
          <p>The platform is provided "AS IS" without warranties of any kind.</p>
          <p>Michelle Rogers is not liable for losses exceeding $50 per claim.</p>
          <p>Users assume all risk. Donations are voluntary and may not reach campaign goals.</p>
          <p>The Interplanetary Fund name and code are proprietary — copying is prohibited.</p>
        </div>
        <button
          onClick={accept}
          className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition-colors"
        >
          I Agree — Continue
        </button>
      </div>
    </div>
  );
}
