import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Building2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const LandingPage = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background bg-mesh flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>

      {/* Animated bg particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 200 + i * 50,
              height: 200 + i * 50,
              background: `radial-gradient(circle, hsla(150, 60%, 40%, ${0.05 + i * 0.01}), transparent)`,
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12 relative z-10"
      >
        <h1 className="text-4xl md:text-6xl font-display font-bold text-gradient-primary mb-4">
          {t("landing.title")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          {t("landing.subtitle")}
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6 relative z-10">
        <motion.button
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onMouseEnter={() => setHovered("farmer")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => navigate("/farmer-dashboard")}
          className={`glass rounded-2xl p-8 w-72 text-center transition-all duration-300 cursor-pointer ${
            hovered === "farmer" ? "glow-primary" : ""
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">
            {t("landing.farmer")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t("landing.farmerDesc")}
          </p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onMouseEnter={() => setHovered("buyer")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => navigate("/buyer-login")}
          className={`glass rounded-2xl p-8 w-72 text-center transition-all duration-300 cursor-pointer ${
            hovered === "buyer" ? "glow-gold" : ""
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-accent" />
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">
            {t("landing.buyer")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t("landing.buyerDesc")}
          </p>
        </motion.button>
      </div>
    </div>
  );
};

export default LandingPage;
