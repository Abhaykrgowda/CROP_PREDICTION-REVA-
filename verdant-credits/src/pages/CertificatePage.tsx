import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Leaf } from "lucide-react";
import {
  getCurrentFarmerId,
  getFarmers,
  type Certificate,
} from "@/lib/storage";
import CarbonCertificate from "@/components/CarbonCertificate";
import { useI18n } from "@/lib/i18n";

const CertificatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    const farmerId =
      (location.state as { farmerId?: string })?.farmerId ||
      getCurrentFarmerId();
    if (!farmerId) {
      navigate("/farmer-dashboard");
      return;
    }
    const farmer = getFarmers().find(
      (f) => f.id === farmerId && f.listed && f.certificateIssuedAt,
    );
    if (!farmer) {
      navigate("/farmer-dashboard");
      return;
    }
    setCertificate({
      farmerName: farmer.name,
      uniqueId: farmer.uniqueId,
      carbonCredits: farmer.carbonCredits,
      issuedAt: farmer.certificateIssuedAt!,
      farmSize: farmer.farmSize,
      location: { lat: farmer.lat, lng: farmer.lng },
    });
  }, [navigate, location.state]);

  if (!certificate) return null;

  return (
    <div className="min-h-screen bg-background bg-mesh p-4 md:p-8">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <button
            onClick={() => navigate("/farmer-dashboard")}
            className="glass rounded-lg p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            <h1 className="font-display text-xl font-bold text-foreground">
              {t("cert.title")}
            </h1>
          </div>
        </motion.div>

        <CarbonCertificate certificate={certificate} />
      </div>
    </div>
  );
};

export default CertificatePage;
