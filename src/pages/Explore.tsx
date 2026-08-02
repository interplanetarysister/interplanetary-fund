import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Explore() {
  const campaigns = useQuery(api.campaigns.getCampaigns, {});
  const balances = useQuery(api.treasury.aggregateBalances, {});

  if (!campaigns || !balances) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-ifaccent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeCampaigns = campaigns.filter((c: any) => c.status === "active");
  const totalRaised = balances.grandTotal?.raised || 0;
  const totalDonors = balances.grandTotal?.donors || 0;

  return (
    <div className="space-y-5">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-ifaccent/20 to-ifcyan/10 border border-ifborder p-5">
        <h2 className="text-xl font-bold text-iftext">Together we can</h2>
        <p className="text-sm text-ifmuted mt-1">
          ${totalRaised.toLocaleString()} raised by {totalDonors} supporters
        </p>
        <div className="mt-3 flex gap-2">
          <div className="flex-1 h-1.5 bg-ifborder rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-ifaccent to-ifcyan rounded-full"
              style={{ width: "68%" }}
            />
          </div>
        </div>
      </div>

      {/* Campaign Cards */}
      <div>
        <h3 className="text-sm font-semibold text-iftext mb-3">Active Campaigns</h3>
        <div className="space-y-4">
          {activeCampaigns.length === 0 && (
            <div className="card text-center py-8">
              <p className="text-sm text-ifmuted">New campaigns coming soon!</p>
            </div>
          )}

          {activeCampaigns.map((c: any) => {
            const progress = c.goalAmount > 0
              ? Math.min(100, Math.round((c.raisedAmount / c.goalAmount) * 100))
              : 0;

            return (
              <div key={c._id} className="card overflow-hidden">
                {/* Campaign image placeholder */}
                <div className="h-32 -mx-4 -mt-4 mb-3 bg-gradient-to-br from-ifaccent/30 to-ifcyan/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-ifaccent/60">{c.category}</span>
                </div>

                {/* Title & summary */}
                <h4 className="text-sm font-semibold text-iftext">{c.title}</h4>
                {c.summary && (
                  <p className="text-xs text-ifmuted mt-1 line-clamp-2">{c.summary}</p>
                )}

                {/* Progress */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-iftext font-medium">
                      ${c.raisedAmount.toLocaleString()}
                    </span>
                    <span className="text-ifmuted">
                      of ${c.goalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-ifborder rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-ifaccent to-ifcyan rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-ifmuted mt-1">
                    <span>{progress}% funded</span>
                    <span>{c.donorCount} supporters</span>
                  </div>
                </div>

                {/* Support button */}
                <button className="w-full mt-4 py-2.5 rounded-xl bg-ifaccent text-white text-sm font-semibold active:scale-[0.98] transition-transform">
                  Support this campaign
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Impact stats */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="card text-center">
          <p className="text-2xl font-bold text-ifcyan">{activeCampaigns.length}</p>
          <p className="text-[10px] text-ifmuted mt-1">Active campaigns</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-ifgreen">{totalDonors}</p>
          <p className="text-[10px] text-ifmuted mt-1">Total supporters</p>
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center py-4">
        <p className="text-[10px] text-ifmuted">
          Every dollar makes a difference 💜
        </p>
      </div>
    </div>
  );
}
