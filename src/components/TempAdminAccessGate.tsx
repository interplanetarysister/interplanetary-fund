/*
 * Interplanetary Fund — Copyright © 2026 Michelle Rogers. All Rights Reserved.
 * PROPRIETARY AND CONFIDENTIAL. Do not copy, distribute, or modify without
 * express written permission. See LICENSE file for full terms.
 */

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function TempAdminAccessGate({
  onUnlock,
}: {
  onUnlock: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const check = useQuery(
    api.tempAdminAccess.validateTempAdminAccessCode,
    code.length >= 4 ? { code } : "skip"
  );

  const handleUnlock = () => {
    if (check?.valid) {
      setError(false);
      onUnlock();
      return;
    }

    setError(true);
    setCode("");
  };

  return (
    <div className="card space-y-3 border-ifcyan/30">
      <h3 className="text-sm font-semibold text-ifcyan">Temporary Admin Access</h3>
      <p className="text-xs text-ifmuted">
        Enter the temporary access code for a limited maintenance session.
      </p>
      <input
        type="password"
        inputMode="text"
        placeholder="Temporary access code"
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          setError(false);
        }}
        className="input-field text-center text-sm tracking-[0.2em] font-semibold"
        autoFocus
      />
      {error && <p className="text-xs text-ifred">Invalid temporary access code.</p>}
      <button onClick={handleUnlock} disabled={code.length < 4} className="btn-primary">
        Unlock Temporary Admin Access
      </button>
    </div>
  );
}
