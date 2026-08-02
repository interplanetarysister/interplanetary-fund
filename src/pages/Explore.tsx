import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const PRESET_AMOUNTS = [5, 10, 25, 50];

export default function Explore() {
  const campaigns = useQuery(api.campaigns.getCampaigns, {});
  const balances = useQuery(api.treasury.aggregateBalances, {});
  const recordDonation = useMutation(api.campaigns.recordDonation);

  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [donationAmount, setDonationAmount] = useState(25);
  const [donorName, setDonorName] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [donationStep, setDonationStep] = useState<"amount" | "info" | "processing" | "done">("amount");

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

  const handleSupport = (campaign: any) => {
    setSelectedCampaign(campaign);
    setDonationAmount(25);
    setDonorName("");
    setDonationMessage("");
    setDonationStep("amount");
  };

  const handleCloseModal = () => {
    setSelectedCampaign(null);
    setDonationStep("amount");
  };

  const handleContinueToInfo = () => {
    setDonationStep("info");
  };

  const handleCompleteDonation = async () => {
    if (!selectedCampaign) return;
    setDonationStep("processing");
    try {
      await recordDonation({
        campaignId: selectedCampaign.ifCampaignId,
        campaignTitle: selectedCampaign.title,
        amount: donationAmount,
        donorName: donorName || "Anonymous",
        message: donationMessage || undefined,
        paymentMethod: "cashapp",
      });
      setDonationStep("done");
    } catch (e) {
      setDonationStep("amount");
      alert("Something went wrong. Please try again.");
    }
  };

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
                {/* Campaign cover image */}
                <div className="h-40 -mx-4 -mt-4 mb-3 overflow-hidden relative">
                  {c.coverImageUrl ? (
                    <img
                      src={c.coverImageUrl}
                      alt={c.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-ifaccent/30 to-ifcyan/20 flex items-center justify-center">
                      <span className="text-3xl font-bold text-ifaccent/60">{c.category}</span>
                    </div>
                  )}
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
                <button
                  onClick={() => handleSupport(c)}
                  className="w-full mt-4 py-2.5 rounded-xl bg-ifaccent text-white text-sm font-semibold active:scale-[0.98] transition-transform"
                >
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
          Every dollar makes a difference
        </p>
      </div>

      {/* Donation Modal */}
      {selectedCampaign && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={handleCloseModal}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal content */}
          <div
            className="relative w-full max-w-md bg-ifcard rounded-t-3xl sm:rounded-3xl border border-ifborder p-6 space-y-4 animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-ifborder flex items-center justify-center text-ifmuted text-lg"
            >
              x
            </button>

            {/* Amount step */}
            {donationStep === "amount" && (
              <>
                <div>
                  <h3 className="text-base font-bold text-iftext">Support "{selectedCampaign.title}"</h3>
                  <p className="text-xs text-ifmuted mt-1">Choose an amount to donate</p>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setDonationAmount(amt)}
                      className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        donationAmount === amt
                          ? "bg-ifaccent text-white"
                          : "bg-ifborder text-iftext"
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs text-ifmuted">Custom amount</label>
                  <div className="mt-1 flex items-center gap-2 bg-ifborder rounded-xl px-3 py-2.5">
                    <span className="text-ifmuted text-sm">$</span>
                    <input
                      type="number"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(Number(e.target.value))}
                      className="flex-1 bg-transparent text-iftext text-sm outline-none"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                <button
                  onClick={handleContinueToInfo}
                  disabled={donationAmount <= 0}
                  className="w-full py-3 rounded-xl bg-ifaccent text-white text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                  Continue
                </button>
              </>
            )}

            {/* Info step */}
            {donationStep === "info" && (
              <>
                <div>
                  <h3 className="text-base font-bold text-iftext">Almost there!</h3>
                  <p className="text-xs text-ifmuted mt-1">
                    Donating ${donationAmount} to "{selectedCampaign.title}"
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-ifmuted">Your name (optional)</label>
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="mt-1 w-full bg-ifborder rounded-xl px-3 py-2.5 text-iftext text-sm outline-none"
                      placeholder="Anonymous"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-ifmuted">Message (optional)</label>
                    <textarea
                      value={donationMessage}
                      onChange={(e) => setDonationMessage(e.target.value)}
                      className="mt-1 w-full bg-ifborder rounded-xl px-3 py-2.5 text-iftext text-sm outline-none resize-none"
                      rows={2}
                      placeholder="Words of support..."
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-ifborder">
                  <p className="text-[10px] text-ifmuted mb-3">
                    Payment method: CashApp. You'll be redirected to complete your donation.
                  </p>
                  <button
                    onClick={handleCompleteDonation}
                    className="w-full py-3 rounded-xl bg-ifaccent text-white text-sm font-semibold active:scale-[0.98] transition-transform"
                  >
                    Donate ${donationAmount}
                  </button>
                </div>
              </>
            )}

            {/* Processing step */}
            {donationStep === "processing" && (
              <div className="py-8 text-center">
                <div className="w-10 h-10 border-2 border-ifaccent border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-ifmuted mt-3">Processing your donation...</p>
              </div>
            )}

            {/* Done step */}
            {donationStep === "done" && (
              <div className="py-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-ifgreen/20 flex items-center justify-center mx-auto">
                  <span className="text-3xl">✓</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-iftext">Thank you!</h3>
                  <p className="text-sm text-ifmuted mt-1">
                    Your ${donationAmount} donation to "{selectedCampaign.title}" has been recorded.
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-full py-3 rounded-xl bg-ifborder text-iftext text-sm font-semibold"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
