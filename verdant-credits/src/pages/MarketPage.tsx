import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  LogOut,
  ShoppingCart,
  Layers,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCurrentBuyer,
  getBuyers,
  getListedFarmers,
  getFarmers,
  saveFarmer,
  savePurchase,
  logout,
  getMarketPrice,
  generatePriceHistory,
  type Farmer,
} from "@/lib/storage";
import CreditCard from "@/components/CreditCard";
import PriceChart from "@/components/PriceChart";
import IndiaMap from "@/components/IndiaMap";
import PaymentModal from "@/components/PaymentModal";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const MarketPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [buyerPhone, setBuyerPhone] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [listedFarmers, setListedFarmers] = useState<Farmer[]>([]);
  const [marketPrice, setMarketPrice] = useState(getMarketPrice());
  const [tab, setTab] = useState<"credits" | "bulk" | "map" | "chart">(
    "credits",
  );
  const [bulkAmount, setBulkAmount] = useState("");

  // Payment modal state
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState<{
    type: "single" | "bulk";
    farmers: Farmer[];
    credits: number;
    cost: number;
  } | null>(null);

  useEffect(() => {
    const phone = getCurrentBuyer();
    if (!phone) {
      navigate("/buyer-login");
      return;
    }
    setBuyerPhone(phone);
    const buyer = getBuyers().find((b) => b.phone === phone);
    if (buyer) setCompanyName(buyer.companyName);
    refreshListings();

    const interval = setInterval(() => setMarketPrice(getMarketPrice()), 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const refreshListings = () => setListedFarmers(getListedFarmers());

  const handleBuy = (farmer: Farmer) => {
    const cost = farmer.carbonCredits * marketPrice;
    setPendingPurchase({
      type: "single",
      farmers: [farmer],
      credits: farmer.carbonCredits,
      cost,
    });
    setPaymentOpen(true);
  };

  const handleBulkBuy = () => {
    const needed = parseFloat(bulkAmount);
    if (!needed || needed <= 0) {
      toast.error(t("market.invalidAmount"));
      return;
    }

    const available = getListedFarmers();
    let remaining = needed;
    const selected: Farmer[] = [];

    for (const f of available) {
      if (remaining <= 0) break;
      selected.push(f);
      remaining -= f.carbonCredits;
    }

    if (remaining > 0) {
      toast.error(t("market.notEnough", { credits: remaining.toFixed(1) }));
      return;
    }

    const cost = needed * marketPrice;
    setPendingPurchase({
      type: "bulk",
      farmers: selected,
      credits: needed,
      cost,
    });
    setPaymentOpen(true);
  };

  const completePurchase = () => {
    if (!pendingPurchase) return;

    if (pendingPurchase.type === "single") {
      const farmer = pendingPurchase.farmers[0];
      const updated = { ...farmer, sold: true, listed: false };
      saveFarmer(updated);
      savePurchase({
        id: `PUR-${Date.now()}`,
        buyerPhone: buyerPhone!,
        farmerIds: [farmer.id],
        totalCredits: farmer.carbonCredits,
        totalCost: pendingPurchase.cost,
        date: new Date().toISOString(),
      });
      refreshListings();
      toast.success(
        t("market.purchased", {
          credits: farmer.carbonCredits,
          cost: pendingPurchase.cost.toFixed(2),
        }),
      );
    } else {
      pendingPurchase.farmers.forEach((f) => {
        saveFarmer({ ...f, sold: true, listed: false });
      });
      savePurchase({
        id: `BULK-${Date.now()}`,
        buyerPhone: buyerPhone!,
        farmerIds: pendingPurchase.farmers.map((f) => f.id),
        totalCredits: pendingPurchase.credits,
        totalCost: pendingPurchase.cost,
        date: new Date().toISOString(),
      });
      refreshListings();
      toast.success(
        t("market.bulkPurchased", {
          credits: pendingPurchase.credits,
          count: pendingPurchase.farmers.length,
          cost: pendingPurchase.cost.toFixed(2),
        }),
      );
      setBulkAmount("");
    }

    setPaymentOpen(false);
    setPendingPurchase(null);
  };

  const handleLogout = () => {
    logout();
    toast.success(t("farmer.loggedOut"));
    navigate("/");
  };

  const tabs = [
    { id: "credits" as const, label: t("market.credits"), icon: ShoppingCart },
    { id: "bulk" as const, label: t("market.bulkBuy"), icon: Layers },
    {
      id: "map" as const,
      label: t("market.map"),
      icon: () => <span className="text-xs">🗺️</span>,
    },
    { id: "chart" as const, label: t("market.priceTab"), icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background bg-mesh p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                {t("market.title")}
              </h1>
              <p className="text-muted-foreground text-xs">{companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass rounded-lg px-4 py-2 text-sm">
              <span className="text-muted-foreground">{t("market.price")}</span>
              <span className="text-accent font-display font-bold">
                ₹{marketPrice.toFixed(2)}
              </span>
              <span className="text-muted-foreground text-xs">
                {t("market.perCredit")}
              </span>
            </div>
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="glass rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> {t("farmer.logout")}
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`glass rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                tab === tb.id
                  ? "bg-primary/20 text-primary glow-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tb.icon className="w-4 h-4" />
              {tb.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "credits" && (
            <motion.div
              key="credits"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {listedFarmers.length === 0 ? (
                <div className="glass-strong rounded-2xl p-12 text-center">
                  <p className="text-muted-foreground">
                    {t("market.noCredits")}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {listedFarmers.map((f) => (
                    <CreditCard
                      key={f.id}
                      farmer={f}
                      marketPrice={marketPrice}
                      onBuy={() => handleBuy(f)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === "bulk" && (
            <motion.div
              key="bulk"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="glass-strong rounded-2xl p-6 md:p-8 max-w-lg mx-auto">
                <h2 className="font-display text-lg font-semibold text-foreground mb-2">
                  {t("market.bulkCredits")}
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  {t("market.bulkDesc")}
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      {t("market.creditsNeeded")}
                    </label>
                    <input
                      type="number"
                      value={bulkAmount}
                      onChange={(e) => setBulkAmount(e.target.value)}
                      placeholder={t("market.creditsPlaceholder")}
                      className="w-full bg-secondary/50 border border-border rounded-lg py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  {bulkAmount && parseFloat(bulkAmount) > 0 && (
                    <div className="glass rounded-lg p-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t("market.estimatedCost")}
                        </span>
                        <span className="text-accent font-display font-bold">
                          ₹{(parseFloat(bulkAmount) * marketPrice).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-muted-foreground">
                          {t("market.available")}
                        </span>
                        <span className="text-foreground">
                          {listedFarmers
                            .reduce((s, f) => s + f.carbonCredits, 0)
                            .toFixed(1)}{" "}
                          {t("market.creditsSuffix")}
                        </span>
                      </div>
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBulkBuy}
                    className="w-full bg-accent text-accent-foreground rounded-lg py-3 font-semibold glow-gold transition-all"
                  >
                    {t("market.buyBulk")}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="glass-strong rounded-2xl p-4 md:p-6">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                  {t("market.creditLocations")}
                </h2>
                <IndiaMap farmers={getListedFarmers()} />
              </div>
            </motion.div>
          )}

          {tab === "chart" && (
            <motion.div
              key="chart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PriceChart />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stripe Payment Modal */}
        <PaymentModal
          open={paymentOpen}
          onClose={() => {
            setPaymentOpen(false);
            setPendingPurchase(null);
          }}
          onSuccess={completePurchase}
          credits={pendingPurchase?.credits ?? 0}
          cost={pendingPurchase?.cost ?? 0}
          farmerCount={pendingPurchase?.farmers.length}
        />
      </div>
    </div>
  );
};

export default MarketPage;
