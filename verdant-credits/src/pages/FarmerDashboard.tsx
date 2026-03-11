import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, MapPin, Ruler, FlaskConical, LogOut, Check } from "lucide-react";
import { toast } from "sonner";
import {
  getCurrentFarmerId,
  setCurrentFarmerId,
  getFarmers,
  saveFarmer,
  calculateCarbonCredits,
  generateUniqueId,
  generateCertificate,
  logout,
  type Farmer,
} from "@/lib/storage";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import IndiaMap from "@/components/IndiaMap";

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useI18n();
  const [existingFarmer, setExistingFarmer] = useState<Farmer | null>(null);
  const [name, setName] = useState("");
  const [n, setN] = useState("");
  const [p, setP] = useState("");
  const [k, setK] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [step, setStep] = useState<"form" | "result">("form");
  const [credits, setCredits] = useState(0);
  const [uniqueId, setUniqueId] = useState("");
  const [fromCropSmart, setFromCropSmart] = useState(false);

  useEffect(() => {
    // Auto-fill and auto-calculate if coming from CropSmart
    const from = searchParams.get("from");
    if (from === "cropsmart") {
      const qName = searchParams.get("name") || "Farmer";
      const qPhone = searchParams.get("phone") || "";
      const qN = parseFloat(searchParams.get("n") || "0");
      const qP = parseFloat(searchParams.get("p") || "0");
      const qK = parseFloat(searchParams.get("k") || "0");
      const qFarmSize = parseFloat(searchParams.get("farmSize") || "1");
      const qLat = parseFloat(searchParams.get("lat") || "0");
      const qLng = parseFloat(searchParams.get("lng") || "0");

      setFromCropSmart(true);

      // Check if we already have a record for this farmer
      const existingFromPhone = getFarmers().find(
        (f) => f.phone === qPhone && !f.sold
      );
      if (existingFromPhone) {
        setExistingFarmer(existingFromPhone);
        setStep("result");
        setCredits(existingFromPhone.carbonCredits);
        setUniqueId(existingFromPhone.uniqueId);
        return;
      }

      // Auto-calculate and save
      const npk = { n: qN, p: qP, k: qK };
      const calculatedCredits = calculateCarbonCredits(npk, qFarmSize);
      const uid = generateUniqueId(qLat, qLng);

      const farmer: Farmer = {
        id: `farmer-${Date.now()}`,
        name: qName,
        phone: qPhone,
        npk,
        farmSize: qFarmSize,
        lat: qLat,
        lng: qLng,
        carbonCredits: calculatedCredits,
        uniqueId: uid,
        listed: false,
        sold: false,
        createdAt: new Date().toISOString(),
      };

      saveFarmer(farmer);
      setCurrentFarmerId(farmer.id);
      setExistingFarmer(farmer);
      setCredits(calculatedCredits);
      setUniqueId(uid);
      setStep("result");
      toast.success(`Welcome ${qName}! Your carbon credits have been calculated automatically.`);
      return;
    }

    const farmerId = getCurrentFarmerId();
    if (farmerId) {
      const existing = getFarmers().find((f) => f.id === farmerId && !f.sold);
      if (existing) {
        setExistingFarmer(existing);
        setStep("result");
        setCredits(existing.carbonCredits);
        setUniqueId(existing.uniqueId);
      }
    }
  }, []);

  const handleCalculate = () => {
    if (!name || !n || !p || !k || !farmSize || !lat || !lng) {
      toast.error(t("farmer.fillAll"));
      return;
    }

    const npk = { n: parseFloat(n), p: parseFloat(p), k: parseFloat(k) };
    const size = parseFloat(farmSize);
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (npk.n < 0 || npk.p < 0 || npk.k < 0) {
      toast.error("NPK values cannot be negative");
      return;
    }
    if (size <= 0) {
      toast.error("Farm size must be greater than 0");
      return;
    }
    if (latitude < -90 || latitude > 90) {
      toast.error("Latitude must be between -90 and 90");
      return;
    }
    if (longitude < -180 || longitude > 180) {
      toast.error("Longitude must be between -180 and 180");
      return;
    }

    const calculatedCredits = calculateCarbonCredits(npk, size);
    const uid = generateUniqueId(latitude, longitude);

    const farmer: Farmer = {
      id: `farmer-${Date.now()}`,
      name,
      phone: "",
      npk,
      farmSize: size,
      lat: latitude,
      lng: longitude,
      carbonCredits: calculatedCredits,
      uniqueId: uid,
      listed: false,
      sold: false,
      createdAt: new Date().toISOString(),
    };

    saveFarmer(farmer);
    setCurrentFarmerId(farmer.id);
    setCredits(calculatedCredits);
    setUniqueId(uid);
    setExistingFarmer(farmer);
    setStep("result");
    toast.success(
      t("farmer.creditsCalculated", { credits: calculatedCredits }),
    );
  };

  const handleListToMarket = () => {
    if (existingFarmer) {
      const cert = generateCertificate(existingFarmer);
      const updated = {
        ...existingFarmer,
        listed: true,
        certificateIssuedAt: cert.issuedAt,
      };
      saveFarmer(updated);
      setExistingFarmer(updated);
      toast.success(t("farmer.listedSuccess"));
      navigate("/certificate", { state: { farmerId: updated.id } });
    }
  };

  const handleLogout = () => {
    logout();
    toast.success(t("farmer.loggedOut"));
    navigate("/");
  };

  const inputClass =
    "w-full bg-secondary/50 border border-border rounded-lg py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";

  return (
    <div className="min-h-screen bg-background bg-mesh p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                {t("farmer.dashboard")}
              </h1>
              <p className="text-muted-foreground text-xs">
                {existingFarmer?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="glass rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> {t("farmer.logout")}
            </button>
          </div>
        </motion.div>

        {step === "form" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-2xl p-6 md:p-8"
          >
            <h2 className="font-display text-lg font-semibold text-foreground mb-6">
              {t("farmer.registerFarm")}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  {t("farmer.name")}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("farmer.namePlaceholder")}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                  <FlaskConical className="w-3 h-3" /> {t("farmer.npk")}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    value={n}
                    onChange={(e) => setN(e.target.value)}
                    placeholder="N"
                    min="0"
                    className={inputClass}
                  />
                  <input
                    type="number"
                    value={p}
                    onChange={(e) => setP(e.target.value)}
                    placeholder="P"
                    min="0"
                    className={inputClass}
                  />
                  <input
                    type="number"
                    value={k}
                    onChange={(e) => setK(e.target.value)}
                    placeholder="K"
                    min="0"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                  <Ruler className="w-3 h-3" /> {t("farmer.farmSize")}
                </label>
                <input
                  type="number"
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  placeholder={t("farmer.farmSizePlaceholder")}
                  min="0.01"
                  step="0.01"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {t("farmer.location")}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder={t("farmer.latitude")}
                    min="-90"
                    max="90"
                    className={inputClass}
                  />
                  <input
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder={t("farmer.longitude")}
                    min="-180"
                    max="180"
                    className={inputClass}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCalculate}
                className="w-full bg-primary text-primary-foreground rounded-lg py-3 font-semibold glow-primary transition-all mt-2"
              >
                {t("farmer.calculate")}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Credit Card */}
            <div className="glass-strong rounded-2xl p-6 md:p-8 text-center">
              <p className="text-muted-foreground text-sm mb-2">
                {t("farmer.yourCredits")}
              </p>

              {/* Rotating coin */}
              <div
                className="flex justify-center my-6"
                style={{ perspective: "400px" }}
              >
                <div
                  className="coin-rotate w-24 h-24 rounded-full flex items-center justify-center pulse-glow"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(50, 95%, 70%), hsl(45, 90%, 55%), hsl(38, 80%, 40%))",
                  }}
                >
                  <span
                    className="font-display font-bold text-2xl"
                    style={{ color: "hsl(160, 30%, 6%)" }}
                  >
                    {credits}
                  </span>
                </div>
              </div>

              <h2 className="font-display text-3xl font-bold text-gradient-gold">
                {t("farmer.creditsYear", { credits })}
              </h2>
              <p className="text-muted-foreground text-sm mt-2">
                {t("farmer.uniqueId")}{" "}
                <span className="text-primary font-mono">{uniqueId}</span>
              </p>

              {existingFarmer?.listed ? (
                <div className="mt-4 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Check className="w-5 h-5" />
                    <span className="font-semibold">
                      {t("farmer.listedOnMarket")}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      navigate("/certificate", {
                        state: { farmerId: existingFarmer.id },
                      })
                    }
                    className="glass rounded-lg px-6 py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {t("farmer.viewCertificate")}
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleListToMarket}
                  className="mt-6 bg-accent text-accent-foreground rounded-lg px-8 py-3 font-semibold glow-gold transition-all"
                >
                  {t("farmer.listOnMarket")}
                </motion.button>
              )}
            </div>

            {/* Details */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-sm font-semibold text-foreground mb-4">
                {t("farmer.farmDetails")}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">
                    {t("farmer.detailName")}
                  </p>
                  <p className="text-foreground font-medium">
                    {existingFarmer?.name}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {t("farmer.detailFarmSize")}
                  </p>
                  <p className="text-foreground font-medium">
                    {existingFarmer?.farmSize} {t("farmer.acres")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {t("farmer.detailNPK")}
                  </p>
                  <p className="text-foreground font-medium">
                    {existingFarmer?.npk.n}-{existingFarmer?.npk.p}-
                    {existingFarmer?.npk.k}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {t("farmer.detailLocation")}
                  </p>
                  <p className="text-foreground font-medium">
                    {existingFarmer?.lat.toFixed(2)},{" "}
                    {existingFarmer?.lng.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {t("farmer.creditsFrequency")}
                  </p>
                  <p className="text-foreground font-medium">
                    {t("farmer.perYear")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {t("farmer.registered")}
                  </p>
                  <p className="text-foreground font-medium">
                    {existingFarmer?.createdAt
                      ? new Date(existingFarmer.createdAt).toLocaleDateString(
                          "en-IN",
                        )
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Map with carbon credit pin */}
            {existingFarmer && existingFarmer.lat !== 0 && existingFarmer.lng !== 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Farm Location — Carbon Credits
                </h3>
                <IndiaMap farmers={[existingFarmer]} />
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
