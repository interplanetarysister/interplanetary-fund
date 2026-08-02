import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type AdminTab = "overview" | "campaigns" | "agents" | "treasury" | "reports";

const TABS: { id: AdminTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "campaigns", label: "Campaigns" },
  { id: "agents", label: "Agents" },
  { id: "treasury", label: "Treasury" },
  { id: "reports", label: "Reports" },
];

export default function Admin() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const balances = useQuery(api.treasury.aggregateBalances, {});
  const agents = useQuery(api.agents.getAgentStats, {});
  const campaigns = useQuery(api.campaigns.getCampaigns, {});
  const latestReport = useQuery(api.protocol.getLatestReport, {});

  if (!balances || !agents) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-ifaccent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Admin badge */}
      <div className="flex items-center gap-2 text-xs text-ifmuted">
        <span className="px-2 py-0.5 rounded-full bg-ifaccent/20 text-ifaccent font-medium text-[10px]">
          ADMIN MODE
        </span>
        <span>Tap "Exit Admin" to return to user view</span>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-4 px-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              tab === t.id
                ? "bg-ifaccent text-white"
                : "bg-ifcard text-ifmuted border border-ifborder"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-card">
              <p className="text-xs text-ifmuted font-medium">Total Raised</p>
              <p className="text-2xl font-bold text-ifcyan mt-1">
                ${balances.grandTotal.raised.toLocaleString()}
              </p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-ifmuted font-medium">Held in Treasury</p>
              <p className="text-2xl font-bold text-ifaccent mt-1">
                ${balances.holdingAccounts.totalHeld.toLocaleString()}
              </p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-ifmuted font-medium">Total Donors</p>
              <p className="text-2xl font-bold text-ifgreen mt-1">
                {balances.grandTotal.donors.toLocaleString()}
              </p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-ifmuted font-medium">Paid Out</p>
              <p className="text-2xl font-bold text-ifamber mt-1">
                ${balances.holdingAccounts.totalPaidOut.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Campaigns summary */}
          <div className="card">
            <h3 className="text-sm font-semibold text-iftext mb-3">Campaigns</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xl font-bold text-iftext">{balances.localCampaigns.count}</p>
                <p className="text-[10px] text-ifmuted">Total</p>
              </div>
              <div>
                <p className="text-xl font-bold text-ifgreen">{balances.localCampaigns.active}</p>
                <p className="text-[10px] text-ifmuted">Active</p>
              </div>
              <div>
                <p className="text-xl font-bold text-ifamber">{balances.localCampaigns.draft}</p>
                <p className="text-[10px] text-ifmuted">Draft</p>
              </div>
            </div>
          </div>

          {/* Latest audit */}
          {latestReport && (
            <div className="card">
              <h3 className="text-sm font-semibold text-iftext mb-3">Latest Audit</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-lg font-bold text-ifgreen">{latestReport.compliantCampaigns}</p>
                  <p className="text-[10px] text-ifmuted">Compliant</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-ifred">{latestReport.nonCompliantCampaigns}</p>
                  <p className="text-[10px] text-ifmuted">Non-Compliant</p>
                </div>
              </div>
              {latestReport.criticalViolations?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-ifborder">
                  <p className="text-xs text-ifred font-medium mb-1">
                    ⚠ {latestReport.criticalViolations.length} Critical Violations
                  </p>
                  {latestReport.criticalViolations.map((v: any, i: number) => (
                    <p key={i} className="text-[10px] text-ifmuted">
                      {v.standard}: {v.issue}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Campaigns Tab */}
      {tab === "campaigns" && (
        <div className="space-y-3">
          {campaigns?.map((c: any) => {
            const progress = c.goalAmount > 0 ? Math.round((c.raisedAmount / c.goalAmount) * 100) : 0;
            return (
              <div key={c._id} className="card space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-semibold text-iftext">{c.title}</h4>
                  <span className={`badge ${c.status === "active" ? "badge-green" : "badge-amber"}`}>
                    {c.status}
                  </span>
                </div>
                <div className="w-full h-2 bg-ifborder rounded-full overflow-hidden">
                  <div className="h-full bg-ifaccent rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-ifmuted">
                  <span>${c.raisedAmount.toLocaleString()} / ${c.goalAmount.toLocaleString()}</span>
                  <span>{c.donorCount} donors</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className={`badge ${c.outreachEnabled ? "badge-green" : "badge-red"}`}>
                    P1 {c.outreachEnabled ? "✓" : "✗"}
                  </span>
                  <span className={`badge ${c.aiTone ? "badge-green" : "badge-muted"}`}>
                    P2 {c.aiTone ? "✓" : "✗"}
                  </span>
                  <span className={`badge ${c.storyPresent ? "badge-green" : "badge-muted"}`}>
                    P3 {c.storyPresent ? "✓" : "✗"}
                  </span>
                  <span className={`badge ${c.paymentActive ? "badge-green" : "badge-red"}`}>
                    P4 {c.paymentActive ? "✓" : "✗"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Agents Tab */}
      {tab === "agents" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="stat-card">
              <p className="text-xl font-bold text-ifaccent">{agents.total}</p>
              <p className="text-[10px] text-ifmuted">Total</p>
            </div>
            <div className="stat-card">
              <p className="text-xl font-bold text-ifgreen">{agents.active}</p>
              <p className="text-[10px] text-ifmuted">Active</p>
            </div>
            <div className="stat-card">
              <p className="text-xl font-bold text-ifcyan">{agents.averageTrust?.toFixed(0) ?? 0}</p>
              <p className="text-[10px] text-ifmuted">Avg Trust</p>
            </div>
          </div>
          {agents.agents?.map((a: any) => (
            <div key={a.role} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-iftext">{a.name}</p>
                  <p className="text-[10px] text-ifmuted">{a.role}</p>
                </div>
                <span className="badge badge-green">Trust {a.trustScore}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Treasury Tab */}
      {tab === "treasury" && (
        <div className="space-y-3">
          <div className="card">
            <h3 className="text-sm font-semibold text-iftext mb-3">Holding Accounts</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-ifmuted">Total Held</span>
                <span className="text-iftext font-medium">
                  ${balances.holdingAccounts.totalHeld.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-ifmuted">Total Paid Out</span>
                <span className="text-iftext font-medium">
                  ${balances.holdingAccounts.totalPaidOut.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-ifmuted">Pending Payouts</span>
                <span className="text-iftext font-medium">
                  ${balances.holdingAccounts.pendingPayouts?.toLocaleString() ?? 0}
                </span>
              </div>
            </div>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-iftext mb-3">External Platforms</h3>
            <div className="flex justify-between text-xs">
              <span className="text-ifmuted">External Raised</span>
              <span className="text-iftext font-medium">
                ${balances.externalPlatforms.totalRaised.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {tab === "reports" && (
        <div className="space-y-3">
          {latestReport ? (
            <div className="card">
              <h3 className="text-sm font-semibold text-iftext mb-2">
                Audit Report · {new Date(latestReport.auditDate).toLocaleDateString()}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-lg font-bold text-ifgreen">{latestReport.compliantCampaigns}</p>
                  <p className="text-[10px] text-ifmuted">Compliant</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-ifred">{latestReport.nonCompliantCampaigns}</p>
                  <p className="text-[10px] text-ifmuted">Non-Compliant</p>
                </div>
              </div>
              {latestReport.results?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-ifborder space-y-2">
                  {latestReport.results.map((r: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-iftext">{r.title}</span>
                      <span className={r.complianceScore >= 4 ? "text-ifgreen" : "text-ifred"}>
                        {r.complianceScore}/6
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="card text-center py-8">
              <p className="text-sm text-ifmuted">No audit reports yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Credit-free badge */}
      <div className="text-center py-2">
        <p className="text-[10px] text-ifmuted">
          ⚡ Credit-free · Convex backend · Zero Base44 credits
        </p>
      </div>
    </div>
  );
}
